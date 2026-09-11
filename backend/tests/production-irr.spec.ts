import {describe,expect,test} from "vitest";
import {irr} from "../src/domain/calculation.js";
import {calculateProperty} from "../src/services/calculate.js";
import type {Property} from "../src/domain/types.js";

function baseProperty():Property{
 return {
   id:"p1",project:"RC5 test",workflow:"READY_TO_CALCULATE",
   purchasePrice:{value:8_000_000,status:"VERIFIED_DOCUMENT"},
   ownershipType:{value:"LEASEHOLD",status:"VERIFIED_DOCUMENT"},
   acquisitionCosts:{value:200_000,status:"PP_ESTIMATE"},
   initialCapex:{value:800_000,status:"PP_ESTIMATE"},
   annualNoi:{value:720_000,status:"DEVELOPER_MODEL"},
   entryMarketValue:{value:8_000_000,status:"VERIFIED_DOCUMENT"},
   holdingYears:5,exitGrowthRate:.05,sellingCostRate:.06,requiredReturn:.08,
   dataConfidence:80,criticalToVerify:false,isOffPlan:false,
   scores:{rentalEconomics:85,value:82,capitalGrowth:80,liquidity:78,location:90,supply:70,developer:80,legal:82,riskScore:75}
 };
}

describe("RC5 production IRR",()=>{
 test("periodic IRR solver returns expected rate",()=>{
   expect(irr([-100,30,30,30,30,30])).toBeCloseTo(.152382,5);
 });
 test("single-date acquisition uses IRR, not net yield, for production return",()=>{
   const run=calculateProperty(baseProperty());
   expect(run.status).toBe("CALCULATED");
   if(run.status!=="CALCULATED") throw new Error("calculation blocked");
   expect(run.productionReturnMetric).toBe("IRR");
   expect(run.netYield).toBeCloseTo(.08,10);
   expect(run.productionReturn).not.toBeCloseTo(run.netYield!,6);
 });
 test("exit growth starts from entry market value, not TAC",()=>{
   const run=calculateProperty(baseProperty());
   if(run.status!=="CALCULATED") throw new Error("calculation blocked");
   const expected=8_000_000*Math.pow(1.05,5);
   expect(run.exitValue).toBeCloseTo(expected,2);
   expect(run.exitValue).not.toBeCloseTo(9_000_000*Math.pow(1.05,5),2);
 });
 test("missing exit assumptions leaves production IRR unavailable instead of silently using zero",()=>{
   const p=baseProperty(); delete p.exitGrowthRate;
   const run=calculateProperty(p);
   if(run.status!=="CALCULATED") throw new Error("calculation blocked");
   expect(run.productionReturnMetric).toBeNull();
   expect(run.productionReturn).toBeNull();
   expect(run.verdictStatus).toBe("PROVISIONAL");
   expect(run.validation.issues.some(x=>x.code==="MISSING_EXIT_GROWTH")).toBe(true);
 });
});
