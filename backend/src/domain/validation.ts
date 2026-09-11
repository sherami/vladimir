import type { Property } from "./types.js";
export type Severity="ERROR"|"BLOCKER"|"WARNING"|"INFO";
export interface Issue { severity:Severity; code:string; field?:string; message:string; }

export function validateForCalculation(p:Property) {
 const issues:Issue[]=[];
 if(p.purchasePrice?.value == null) issues.push({severity:"BLOCKER",code:"MISSING_PURCHASE_PRICE",field:"purchasePrice",message:"Purchase price is required."});
 if(p.ownershipType?.value == null) issues.push({severity:"BLOCKER",code:"MISSING_OWNERSHIP",field:"ownershipType",message:"Ownership/title status must be known."});
 if(p.isOffPlan && (!p.datedCashFlows || p.datedCashFlows.length<2))
   issues.push({severity:"BLOCKER",code:"MISSING_PAYMENT_SCHEDULE",field:"datedCashFlows",message:"Off-plan requires dated cash flows for XIRR."});
 if(p.isOffPlan && p.datedCashFlows?.some(x=>x.dateStatus && x.dateStatus!=="EXACT_DATE"))
   issues.push({severity:"BLOCKER",code:"NON_EXACT_PAYMENT_DATES",field:"datedCashFlows",message:"Production XIRR requires exact payment dates; month-only or TO_VERIFY dates are insufficient."});
 if(p.criticalToVerify) issues.push({severity:"BLOCKER",code:"CRITICAL_TO_VERIFY",message:"Critical source verification remains unresolved."});
 if(p.annualNoi?.value == null) issues.push({severity:"WARNING",code:"MISSING_NOI",field:"annualNoi",message:"Return metrics will be incomplete without NOI."});
 if(!p.isOffPlan){
   if(p.holdingYears == null) issues.push({severity:"WARNING",code:"MISSING_HOLDING_PERIOD",field:"holdingYears",message:"IRR requires a holding period."});
   else if(!Number.isInteger(p.holdingYears) || p.holdingYears<=0) issues.push({severity:"BLOCKER",code:"INVALID_HOLDING_PERIOD",field:"holdingYears",message:"Holding period must be a positive whole number of years."});
   if(p.exitGrowthRate == null) issues.push({severity:"WARNING",code:"MISSING_EXIT_GROWTH",field:"exitGrowthRate",message:"IRR requires an explicit exit growth assumption."});
   if(p.sellingCostRate == null) issues.push({severity:"WARNING",code:"MISSING_EXIT_COSTS",field:"sellingCostRate",message:"IRR requires an explicit selling cost assumption."});
 }
 return {readyToCalculate:!issues.some(i=>i.severity==="BLOCKER"||i.severity==="ERROR"),issues};
}
