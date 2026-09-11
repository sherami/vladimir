import { createHash } from "node:crypto";
import { v4 as uuid } from "uuid";
import type { Property } from "../domain/types.js";
import { adjustedScore, exitValue, irr, netYield, provisionalVerdict, tac, verdictStatus } from "../domain/calculation.js";
import { validateForCalculation } from "../domain/validation.js";
import { xirr } from "../domain/xirr.js";

export const ENGINE_VERSION="1.0.0-rc.5";
export const METHODOLOGY_VERSION="1.0";

export function calculateProperty(p:Property) {
 const validation=validateForCalculation(p);
 if(!validation.readyToCalculate) return {status:"BLOCKED",validation};

 const total=tac(p.purchasePrice!.value,p.acquisitionCosts?.value??0,p.initialCapex?.value??0);
 const ny=p.annualNoi?.value==null?null:netYield(p.annualNoi.value,total);
 let productionReturn:number|null=null;
 let metric:"XIRR"|"IRR"|null=null;
 let modeledExitValue:number|null=null;
 let netExitProceeds:number|null=null;
 let periodicCashFlows:number[]|null=null;

 if(p.isOffPlan){
   // Exact dated cash flows only; validation blocks missing schedules.
   productionReturn=xirr(p.datedCashFlows!); metric="XIRR";
 } else if(
   p.annualNoi?.value!=null && p.holdingYears!=null && p.holdingYears>0 &&
   p.exitGrowthRate!=null && p.sellingCostRate!=null
 ) {
   const entryValue=p.entryMarketValue?.value ?? p.purchasePrice!.value;
   modeledExitValue=exitValue(entryValue,p.exitGrowthRate,p.holdingYears);
   netExitProceeds=modeledExitValue*(1-p.sellingCostRate);
   periodicCashFlows=[-total];
   for(let year=1;year<=p.holdingYears;year++){
     let cf=p.annualNoi.value;
     if(year===p.holdingYears) cf+=netExitProceeds;
     periodicCashFlows.push(cf);
   }
   productionReturn=irr(periodicCashFlows); metric="IRR";
 }

 const score=p.scores?adjustedScore(p.scores):null;
 const confidence=p.dataConfidence??0;
 const provisional=score==null||productionReturn==null?null:
   provisionalVerdict(score,productionReturn,p.requiredReturn??.08);
 const vStatus=verdictStatus(confidence,!!p.criticalToVerify,false,productionReturn!=null);
 const snapshot=JSON.stringify(p);

 return {
   calculationRunId:uuid(), propertyId:p.id, engineVersion:ENGINE_VERSION,
   methodologyVersion:METHODOLOGY_VERSION,
   inputSnapshotHash:createHash("sha256").update(snapshot).digest("hex"),
   status:"CALCULATED", tac:total, noi:p.annualNoi?.value??null, netYield:ny,
   productionReturnMetric:metric, productionReturn,
   exitValue:modeledExitValue, netExitProceeds, periodicCashFlows,
   riskAdjustedScore:score, provisionalVerdict:provisional,
   verdictStatus:vStatus, finalVerdict:vStatus==="FINAL"?provisional:null, validation
 };
}
