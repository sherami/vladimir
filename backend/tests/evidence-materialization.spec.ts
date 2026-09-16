import { describe,expect,test } from "vitest";
import { applyEvidenceToProperty } from "../src/services/evidence.js";
import { validateForCalculation } from "../src/domain/validation.js";

describe("evidence materialization",()=>{
 test("latest evidence becomes calculation input with provenance",()=>{
  const base:any={id:"p",project:"Test",workflow:"VERIFICATION"};
  const e:any[]=[
    {id:"e1",propertyId:"p",field:"purchasePrice",value:100,status:"PP_ESTIMATE",createdBy:"a",createdAt:"2026-01-01"},
    {id:"e2",propertyId:"p",field:"purchasePrice",value:95,status:"VERIFIED_DOCUMENT",sourceId:"s1",createdBy:"a",createdAt:"2026-01-02"}
  ];
  const p=applyEvidenceToProperty(base,e);
  expect(p.purchasePrice?.value).toBe(95);
  expect(p.purchasePrice?.status).toBe("VERIFIED_DOCUMENT");
  expect(p.purchasePrice?.sourceId).toBe("s1");
 });

 test("normalized exact payment schedule hydrates XIRR inputs and keeps confidence breakdown",()=>{
  const base:any={id:"p",project:"Off-plan",workflow:"VERIFICATION",isOffPlan:true};
  const flows=[
    {date:"2026-01-15",amount:-500000,dateStatus:"EXACT_DATE"},
    {date:"2027-01-15",amount:650000,dateStatus:"EXACT_DATE"}
  ];
  const e:any[]=[
    {id:"e1",propertyId:"p",field:"purchasePrice",value:500000,status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"},
    {id:"e2",propertyId:"p",field:"ownershipType",value:"LEASEHOLD",status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"},
    {id:"e3",propertyId:"p",field:"paymentSchedule",value:flows,status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"}
  ];
  const p=applyEvidenceToProperty(base,e);
  expect(p.datedCashFlows).toEqual(flows);
  expect(p.dataConfidenceBreakdown?.byCategory.paymentScheduleTiming.confidence).toBe(100);
  expect(p.dataConfidence).toBeGreaterThan(0);
 });

 test("month-only non-normalized schedule is not fabricated into dated cash flows",()=>{
  const base:any={id:"p",project:"Off-plan",workflow:"VERIFICATION",isOffPlan:true};
  const e:any[]=[
    {id:"e1",propertyId:"p",field:"paymentSchedule",value:[{month:"2026-04",percent:.35}],status:"DEVELOPER_MODEL",createdBy:"a",createdAt:"2026-01-01"}
  ];
  const p=applyEvidenceToProperty(base,e);
  expect(p.datedCashFlows).toBeUndefined();
  expect(p.dataConfidenceBreakdown?.byCategory.paymentScheduleTiming.confidence).toBe(70);
 });

 test("legacy staged payment schedule fails closed as off-plan when lifecycle flag is absent",()=>{
  const base:any={id:"p",project:"Legacy off-plan",workflow:"VERIFICATION"};
  const e:any[]=[
    {id:"e1",propertyId:"p",field:"purchasePrice",value:44229600,status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"},
    {id:"e2",propertyId:"p",field:"ownershipType",value:"Leasehold",status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"},
    {id:"e3",propertyId:"p",field:"paymentSchedule",value:[{period:"2026-04",percent:35},{period:"2026-07",percent:10}],status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"}
  ];
  const p=applyEvidenceToProperty(base,e);
  expect(p.isOffPlan).toBe(true);
  expect(p.datedCashFlows).toBeUndefined();
  const validation=validateForCalculation(p);
  expect(validation.readyToCalculate).toBe(false);
  expect(validation.issues.some(x=>x.code==="MISSING_PAYMENT_SCHEDULE")).toBe(true);
 });

 test("explicit ready-asset lifecycle overrides staged-schedule fallback",()=>{
  const base:any={id:"p",project:"Installment resale",workflow:"VERIFICATION"};
  const e:any[]=[
    {id:"e1",propertyId:"p",field:"isOffPlan",value:false,status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"},
    {id:"e2",propertyId:"p",field:"paymentSchedule",value:[{period:"2026-04",percent:50},{period:"2026-05",percent:50}],status:"VERIFIED_DOCUMENT",createdBy:"a",createdAt:"2026-01-01"}
  ];
  const p=applyEvidenceToProperty(base,e);
  expect(p.isOffPlan).toBe(false);
 });
});
