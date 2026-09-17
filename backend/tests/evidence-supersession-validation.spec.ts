import {describe,expect,test} from "vitest";
import {validateEvidenceSupersession} from "../src/services/evidence-supersession-validation.js";

const prior=(overrides:any={})=>({
 id:"evidence-1",property_id:"property-1",field:"purchasePrice",
 ...overrides
});

describe("evidence supersession validation",()=>{
 test("allows an initial evidence record without supersedesId",()=>{
  expect(validateEvidenceSupersession(
   "property-1","purchasePrice",undefined,undefined
  )).toEqual({valid:true});
 });

 test("accepts a link to evidence for the same property and field",()=>{
  expect(validateEvidenceSupersession(
   "property-1","purchasePrice","evidence-1",prior()
  )).toEqual({valid:true});
 });

 test("rejects a missing superseded record",()=>{
  expect(validateEvidenceSupersession(
   "property-1","purchasePrice","missing",undefined
  )).toMatchObject({valid:false,error:"superseded_evidence_not_found"});
 });

 test("rejects a link across properties",()=>{
  expect(validateEvidenceSupersession(
   "property-1","purchasePrice","evidence-1",
   prior({property_id:"property-2"})
  )).toMatchObject({
   valid:false,error:"superseded_evidence_property_mismatch"
  });
 });

 test("rejects a link across evidence fields",()=>{
  expect(validateEvidenceSupersession(
   "property-1","purchasePrice","evidence-1",
   prior({field:"annualNoi"})
  )).toMatchObject({
   valid:false,error:"superseded_evidence_field_mismatch"
  });
 });
});
