import type { DatedCashFlow, EvidenceRecord, Property } from "../domain/types.js";
import { calculateEvidenceConfidence } from "./confidence.js";

function evidenceWrapper(e:EvidenceRecord){
  return {value:e.value as any,status:e.status,sourceId:e.sourceId,asOf:e.asOf,analystComment:e.analystComment};
}
function asDatedCashFlows(value:unknown):DatedCashFlow[]|undefined{
  if(!Array.isArray(value)) return undefined;
  const valid=value.every(x=>x && typeof x==="object" && typeof (x as any).date==="string" && typeof (x as any).amount==="number");
  return valid ? value as DatedCashFlow[] : undefined;
}

export function applyEvidenceToProperty(base:Property, latest:EvidenceRecord[]):Property {
  const p:{[k:string]:any}={...base};
  for(const e of latest){
    switch(e.field){
      case "purchasePrice":
      case "ownershipType":
      case "acquisitionCosts":
      case "initialCapex":
      case "annualNoi":
      case "entryMarketValue":
        p[e.field]=evidenceWrapper(e); break;
      case "holdingYears":
      case "exitGrowthRate":
      case "sellingCostRate":
      case "requiredReturn":
        p[e.field]=e.value; break;
      case "isOffPlan":
        p.isOffPlan=Boolean(e.value); break;
      case "datedCashFlows": {
        const flows=asDatedCashFlows(e.value);
        if(flows) p.datedCashFlows=flows;
        break;
      }
      case "paymentSchedule": {
        // A paymentSchedule may hydrate authoritative XIRR inputs only when it is already
        // normalized to exact dated cash-flow objects. Month-only schedules remain evidence
        // for confidence/verification and are not fabricated into dates here.
        const flows=asDatedCashFlows(e.value);
        if(flows) p.datedCashFlows=flows;
        break;
      }
    }
  }
  const c=calculateEvidenceConfidence(latest);
  p.dataConfidence=c.score;
  p.dataConfidenceBreakdown={byField:c.byField,byCategory:c.byCategory};
  p.criticalToVerify=c.criticalToVerify;
  return p as Property;
}
