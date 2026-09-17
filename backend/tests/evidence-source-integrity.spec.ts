import {describe,expect,test} from "vitest";
import {validateEvidenceSource} from "../src/services/evidence-source-validation.js";

describe("evidence source integrity",()=>{
 test("verified evidence requires a linked source",()=>{
  expect(validateEvidenceSource("p1","VERIFIED_DOCUMENT",undefined,undefined))
   .toEqual({valid:false,error:"verified_evidence_source_required"});
 });

 test("linked source must exist",()=>{
  expect(validateEvidenceSource("p1","PP_ESTIMATE","missing",undefined))
   .toEqual({valid:false,error:"source_not_found"});
 });

 test("source must belong to the same property",()=>{
  expect(validateEvidenceSource("p1","VERIFIED_DOCUMENT","s1",{
   property_id:"p2",status:"VERIFIED_DOCUMENT"
  })).toEqual({valid:false,error:"source_property_mismatch"});
 });

 test("verified evidence cannot rely on an unverified source",()=>{
  expect(validateEvidenceSource("p1","VERIFIED_DOCUMENT","s1",{
   property_id:"p1",status:"TO_VERIFY"
  })).toEqual({valid:false,error:"verified_evidence_requires_verified_source"});
 });

 test("matching verified source is accepted",()=>{
  expect(validateEvidenceSource("p1","VERIFIED_DOCUMENT","s1",{
   property_id:"p1",status:"VERIFIED_DOCUMENT"
  })).toEqual({valid:true});
 });

 test("non-document estimates may remain source-free",()=>{
  expect(validateEvidenceSource("p1","PP_ESTIMATE",undefined,undefined))
   .toEqual({valid:true});
 });
});
