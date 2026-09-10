import type { EvidenceRecord, Property } from "../domain/types.js";
import { calculateEvidenceConfidence } from "./confidence.js";

function evidenceWrapper(e:EvidenceRecord){
  return {value:e.value as any,status:e.status,sourceId:e.sourceId,asOf:e.asOf,analystComment:e.analystComment};
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
    }
  }
  const c=calculateEvidenceConfidence(latest);
  p.dataConfidence=c.score;
  p.criticalToVerify=c.criticalToVerify;
  return p as Property;
}
