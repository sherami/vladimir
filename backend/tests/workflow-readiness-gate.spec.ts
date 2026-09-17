import {describe,expect,test} from "vitest";
import {evaluateWorkflowTransition} from "../src/domain/workflow.js";

const property=(overrides:any={})=>({
 id:"p",project:"Project",workflow:"VERIFICATION",
 purchasePrice:{value:100,status:"VERIFIED_DOCUMENT"},
 ownershipType:{value:"LEASEHOLD",status:"VERIFIED_DOCUMENT"},
 isOffPlan:false,holdingYears:5,exitGrowthRate:0.04,sellingCostRate:0.06,
 criticalToVerify:false,
 ...overrides
});

describe("workflow calculation readiness gate",()=>{
 test("blocks READY_TO_CALCULATE while validation blockers remain",()=>{
  const decision=evaluateWorkflowTransition(property({purchasePrice:undefined}),"READY_TO_CALCULATE");
  expect(decision.allowed).toBe(false);
  expect(decision).toMatchObject({error:"validation_failed"});
  if(!("validation" in decision))throw new Error("expected validation failure");
  expect(decision.validation.issues.some(x=>x.code==="MISSING_PURCHASE_PRICE")).toBe(true);
 });

 test("blocks month-only off-plan schedules",()=>{
  const decision=evaluateWorkflowTransition(property({
   isOffPlan:true,
   datedCashFlows:[
    {date:"2026-10-01",amount:-50,dateStatus:"MONTH_KNOWN"},
    {date:"2028-10-01",amount:75,dateStatus:"EXACT_DATE"}
   ]
  }),"READY_TO_CALCULATE");
  expect(decision.allowed).toBe(false);
  expect(decision).toMatchObject({error:"validation_failed"});
 });

 test("allows a valid hydrated property to become calculation-ready",()=>{
  expect(evaluateWorkflowTransition(property(),"READY_TO_CALCULATE"))
   .toEqual({allowed:true});
 });

 test("still rejects transitions outside the state machine",()=>{
  expect(evaluateWorkflowTransition(property(),"PUBLISHED"))
   .toMatchObject({allowed:false,error:"invalid_transition"});
 });
});
