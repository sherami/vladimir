import {describe,expect,test} from "vitest";
import {validateForCalculation} from "../src/domain/validation.js";

describe("off-plan XIRR exact-date gate",()=>{
 test("month-only dates block production calculation",()=>{
  const p:any={id:"p",project:"P",workflow:"VERIFICATION",isOffPlan:true,
    purchasePrice:{value:100,status:"VERIFIED_DOCUMENT"},
    ownershipType:{value:"LEASEHOLD",status:"VERIFIED_DOCUMENT"},
    datedCashFlows:[
      {date:"2026-10-01",amount:-50,dateStatus:"MONTH_KNOWN"},
      {date:"2028-10-01",amount:75,dateStatus:"EXACT_DATE"}
    ]};
  const r=validateForCalculation(p);
  expect(r.readyToCalculate).toBe(false);
  expect(r.issues.some((x:any)=>x.code==="NON_EXACT_PAYMENT_DATES")).toBe(true);
 });
});
