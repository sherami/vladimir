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
function isStagedPaymentSchedule(value:unknown):boolean{
  if(!Array.isArray(value) || value.length===0) return false;
  return value.every(x=>x && typeof x==="object" && (
    typeof (x as any).period==="string" || typeof (x as any).month==="string"
  ));
}

export function applyEvidenceToProperty(base:Property, latest:EvidenceRecord[]):Property {
  const p:{[k:string]:any}={...base};
  const hasExplicitLifecycle=latest.some(e=>e.field==="isOffPlan");
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
        if(typeof e.value==="boolean") p.isOffPlan=e.value;
        else if(e.value==="true") p.isOffPlan=true;
        else if(e.value==="false") p.isOffPlan=false;
        break;
      case "datedCashFlows": {
        const flows=asDatedCashFlows(e.value);
        if(flows) p.datedCashFlows=flows;
        break;
      }
      case "paymentSchedule": {
        // A paymentSchedule may hydrate authoritative XIRR inputs only when it is already
        // normalized to exact dated cash-flow objects. Month-only schedules remain evidence
        // and must never be fabricated into exact dates.
        const flows=asDatedCashFlows(e.value);
        if(flows) p.datedCashFlows=flows;
        // Legacy/intake records created before lifecycle was captured explicitly can still
        // carry a staged developer payment schedule. Treat that shape as off-plan so the
        // exact-date XIRR gate fails closed instead of silently running the ready-asset path.
        if(!hasExplicitLifecycle && isStagedPaymentSchedule(e.value)) p.isOffPlan=true;
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
