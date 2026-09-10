import Decimal from "decimal.js";
import type { ScoreInputs, Verdict, VerdictStatus } from "./types.js";

export const WEIGHTS = Object.freeze({
 rentalEconomics:.25, value:.20, capitalGrowth:.15, liquidity:.15,
 location:.10, supply:.05, developer:.05, legal:.05
});

export function tac(purchase:number, acquisition=0, capex=0) {
 return new Decimal(purchase).plus(acquisition).plus(capex).toNumber();
}
export function netYield(noi:number, totalAcquisitionCost:number) {
 if (totalAcquisitionCost <= 0) throw new Error("TAC must be > 0");
 return new Decimal(noi).div(totalAcquisitionCost).toNumber();
}
export function exitValue(entryMarketValue:number, growth:number, years:number) {
 return new Decimal(entryMarketValue).mul(new Decimal(1).plus(growth).pow(years)).toNumber();
}
export function rawInvestmentScore(s:ScoreInputs) {
 return Object.entries(WEIGHTS).reduce((sum,[k,w]) => sum + s[k as keyof typeof WEIGHTS]*w, 0);
}
export function riskMultiplier(risk:number) {
 return risk>=85 ? 1 : risk>=70 ? .95 : risk>=50 ? .85 : .70;
}
export function adjustedScore(s:ScoreInputs) {
 return rawInvestmentScore(s) * riskMultiplier(s.riskScore);
}
export function provisionalVerdict(score:number, investmentReturn:number, requiredReturn:number):Verdict {
 if(score>=80 && investmentReturn>=requiredReturn) return "BUY";
 if(score>=70 && investmentReturn>=Math.max(0,requiredReturn-.02)) return "CONSIDER";
 if(score>=60) return "WATCH";
 return "PASS";
}
export function verdictStatus(confidence:number, criticalToVerify:boolean, hardStop:boolean, returnReady:boolean):VerdictStatus {
 if(hardStop) return "BLOCKED";
 if(!returnReady || confidence<75 || criticalToVerify) return "PROVISIONAL";
 return "FINAL";
}
