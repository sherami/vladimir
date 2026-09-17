import {describe,expect,test} from "vitest";
import {validateSourceInput} from "../src/services/source-validation.js";

const verified=(overrides:any={})=>({
 documentType:"SPA",
 status:"VERIFIED_DOCUMENT",
 title:"SPA unit G-01",
 issuer:"Developer",
 sourceDate:"2026-09-17",
 uri:"libfile_example",
 ...overrides
});

describe("source provenance validation",()=>{
 test("accepts complete verified source metadata",()=>{
  expect(validateSourceInput(verified()).valid).toBe(true);
 });

 test.each([
  ["documentType",""],
  ["title",""],
  ["issuer",""],
  ["sourceDate",""],
  ["uri",""]
 ])("rejects missing or invalid %s",((field:string,value:string)=>{
  const result=validateSourceInput(verified({[field]:value}));
  expect(result.valid).toBe(false);
  expect(result.missingOrInvalidFields).toContain(field);
 }) as any);

 test.each(["2026-02-30","17-09-2026","2026-09"])(
  "rejects invalid source date %s",
  sourceDate=>{
   const result=validateSourceInput(verified({sourceDate}));
   expect(result.valid).toBe(false);
   expect(result.missingOrInvalidFields).toContain("sourceDate");
  }
 );

 test("allows incomplete provenance for explicitly non-verified sources",()=>{
  expect(validateSourceInput({
   documentType:"Developer brochure",
   status:"TO_VERIFY"
  }).valid).toBe(true);
 });

 test("rejects unsupported source status",()=>{
  expect(validateSourceInput({
   documentType:"Brochure",
   status:"VERIFIED"
  })).toMatchObject({
   valid:false,error:"invalid_source_input",
   missingOrInvalidFields:expect.arrayContaining(["status"])
  });
 });

 test("validates dates even for non-verified sources",()=>{
  expect(validateSourceInput({
   documentType:"Market report",
   status:"MARKET_DATA",
   sourceDate:"2026-02-30"
  }).missingOrInvalidFields).toContain("sourceDate");
 });

 test("requires metadata to be a JSON object",()=>{
  expect(validateSourceInput(verified({metadata:["not","an","object"]})))
   .toMatchObject({
    valid:false,
    missingOrInvalidFields:expect.arrayContaining(["metadata"])
   });
 });
});
