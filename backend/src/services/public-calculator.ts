import {exitValue,irr,netYield,tac} from "../domain/calculation.js";

export const PUBLIC_CALCULATOR_VERSION="calculator-1.0";

export type PublicCalculatorInput={
 purchasePrice:number;
 acquisitionCosts:number;
 initialCapex:number;
 annualNoi:number;
 entryMarketValue:number;
 holdingYears:number;
 exitGrowthRate:number;
 sellingCostRate:number;
 requiredReturn:number;
};

const finite=(value:unknown)=>typeof value==="number"&&Number.isFinite(value);

export function validatePublicCalculatorInput(value:any){
 const issues:string[]=[];
 for(const field of ["purchasePrice","acquisitionCosts","initialCapex","annualNoi","entryMarketValue","holdingYears","exitGrowthRate","sellingCostRate","requiredReturn"])
  if(!finite(value?.[field]))issues.push(`${field} must be a finite number`);
 if(finite(value?.purchasePrice)&&value.purchasePrice<=0)issues.push("purchasePrice must be greater than zero");
 for(const field of ["acquisitionCosts","initialCapex","annualNoi","entryMarketValue"])
  if(finite(value?.[field])&&value[field]<0)issues.push(`${field} cannot be negative`);
 if(finite(value?.holdingYears)&&(!Number.isInteger(value.holdingYears)||value.holdingYears<1||value.holdingYears>30))
  issues.push("holdingYears must be a whole number from 1 to 30");
 if(finite(value?.exitGrowthRate)&&(value.exitGrowthRate<=-1||value.exitGrowthRate>1))
  issues.push("exitGrowthRate must be greater than -1 and at most 1");
 if(finite(value?.sellingCostRate)&&(value.sellingCostRate<0||value.sellingCostRate>=1))
  issues.push("sellingCostRate must be at least 0 and below 1");
 if(finite(value?.requiredReturn)&&(value.requiredReturn<=-1||value.requiredReturn>5))
  issues.push("requiredReturn must be greater than -1 and at most 5");
 return {valid:issues.length===0,issues};
}

export function calculatePublicScenario(input:PublicCalculatorInput){
 const total=tac(input.purchasePrice,input.acquisitionCosts,input.initialCapex);
 const modeledExitValue=exitValue(input.entryMarketValue,input.exitGrowthRate,input.holdingYears);
 const netExitProceeds=modeledExitValue*(1-input.sellingCostRate);
 const cashFlows=[-total];
 for(let year=1;year<=input.holdingYears;year++)
  cashFlows.push(input.annualNoi+(year===input.holdingYears?netExitProceeds:0));
 const productionReturn=irr(cashFlows);
 const totalProfit=cashFlows.reduce((sum,value)=>sum+value,0);
 return {
  calculatorVersion:PUBLIC_CALCULATOR_VERSION,
  status:"SCENARIO_ONLY",
  outputs:{
   tac:total,
   netYield:netYield(input.annualNoi,total),
   roi:totalProfit/total,
   productionReturnMetric:"IRR",
   productionReturn,
   requiredReturn:input.requiredReturn,
   requiredReturnGap:productionReturn-input.requiredReturn,
   exitValue:modeledExitValue,
   netExitProceeds,
   periodicCashFlows:cashFlows
  },
  disclosure:"User-adjusted scenario. It does not change a published calculation, Investment Score or Verdict."
 };
}
