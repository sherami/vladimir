import {describe,expect,test} from "vitest";
import {validateEvidenceInput} from "../src/services/evidence-input-validation.js";

const evidence=(overrides:any={})=>({
 field:"purchasePrice",value:10_000_000,status:"VERIFIED_DOCUMENT",
 ...overrides
});

describe("evidence input validation",()=>{
 test("accepts a typed financial fact",()=>{
  expect(validateEvidenceInput(evidence())).toEqual({valid:true});
 });

 test.each([
  {field:"purchasePrice",value:"10000000"},
  {field:"annualNoi",value:-1},
  {field:"holdingYears",value:2.5},
  {field:"sellingCostRate",value:1.5},
  {field:"isOffPlan",value:"true"}
 ])("rejects invalid typed input $field=$value",sample=>{
  expect(validateEvidenceInput(evidence(sample)))
   .toMatchObject({valid:false,error:"invalid_evidence_input"});
 });

 test.each(["id","workflow","dataConfidence","scores"])(
  "rejects protected property field %s",
  field=>{
   expect(validateEvidenceInput(evidence({field,value:"attempt"})))
    .toMatchObject({valid:false,error:"invalid_evidence_input"});
  }
 );

 test("rejects unsupported confidence status",()=>{
  expect(validateEvidenceInput(evidence({status:"VERIFIED"})))
   .toMatchObject({valid:false,error:"invalid_evidence_input"});
 });

 test("rejects impossible as-of dates",()=>{
  expect(validateEvidenceInput(evidence({asOf:"2026-02-30"})))
   .toMatchObject({valid:false,error:"invalid_evidence_input"});
 });

 test("accepts exact dated cash flows",()=>{
  expect(validateEvidenceInput(evidence({
   field:"datedCashFlows",
   value:[
    {date:"2026-10-15",amount:-5_000_000,dateStatus:"EXACT_DATE"},
    {date:"2028-10-15",amount:7_000_000,dateStatus:"EXACT_DATE"}
   ]
  }))).toEqual({valid:true});
 });

 test("rejects non-finite dated cash-flow amounts",()=>{
  expect(validateEvidenceInput(evidence({
   field:"datedCashFlows",
   value:[{date:"2026-10-15",amount:"5000000",dateStatus:"EXACT_DATE"}]
  }))).toMatchObject({valid:false,error:"invalid_evidence_input"});
 });
});
