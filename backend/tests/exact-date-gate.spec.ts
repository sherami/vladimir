import {describe,expect,test} from "vitest";
import {validateForCalculation} from "../src/domain/validation.js";

function offPlanProperty(datedCashFlows:any[]) {
 return {
  id:"p",project:"P",workflow:"VERIFICATION",isOffPlan:true,
  purchasePrice:{value:100,status:"VERIFIED_DOCUMENT"},
  ownershipType:{value:"LEASEHOLD",status:"VERIFIED_DOCUMENT"},
  datedCashFlows
 } as any;
}

describe("off-plan XIRR exact-date gate",()=>{
 test("month-only dates block production calculation",()=>{
  const r=validateForCalculation(offPlanProperty([
   {date:"2026-10-01",amount:-50,dateStatus:"MONTH_KNOWN"},
   {date:"2028-10-01",amount:75,dateStatus:"EXACT_DATE"}
  ]));
  expect(r.readyToCalculate).toBe(false);
  expect(r.issues.some((x:any)=>x.code==="NON_EXACT_PAYMENT_DATES")).toBe(true);
 });

 test("missing date status cannot be treated as exact",()=>{
  const r=validateForCalculation(offPlanProperty([
   {date:"2026-10-01",amount:-50},
   {date:"2028-10-01",amount:75,dateStatus:"EXACT_DATE"}
  ]));
  expect(r.readyToCalculate).toBe(false);
  expect(r.issues.some((x:any)=>x.code==="NON_EXACT_PAYMENT_DATES")).toBe(true);
 });

 test.each(["2026-02-30","01-10-2026","2026-10"])(
  "invalid calendar date %s blocks production calculation",
  date=>{
   const r=validateForCalculation(offPlanProperty([
    {date,amount:-50,dateStatus:"EXACT_DATE"},
    {date:"2028-10-01",amount:75,dateStatus:"EXACT_DATE"}
   ]));
   expect(r.readyToCalculate).toBe(false);
   expect(r.issues.some((x:any)=>x.code==="INVALID_PAYMENT_DATE")).toBe(true);
  }
 );

 test("valid exact ISO dates pass the date gate",()=>{
  const r=validateForCalculation(offPlanProperty([
   {date:"2026-10-01",amount:-50,dateStatus:"EXACT_DATE"},
   {date:"2028-10-01",amount:75,dateStatus:"EXACT_DATE"}
  ]));
  expect(r.issues.some((x:any)=>x.code==="NON_EXACT_PAYMENT_DATES")).toBe(false);
  expect(r.issues.some((x:any)=>x.code==="INVALID_PAYMENT_DATE")).toBe(false);
 });
});
