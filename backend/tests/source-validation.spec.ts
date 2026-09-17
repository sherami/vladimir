import {describe,expect,test} from "vitest";
import {validateSourceInput} from "../src/services/source-validation.js";

const verified=(overrides:any={})=>({
 status:"VERIFIED_DOCUMENT",
 title:"SPA unit G-01",
 issuer:"Developer",
 sourceDate:"2026-09-17",
 uri:"libfile_example",
 ...overrides
});

describe("verified source provenance",()=>{
 test("accepts complete source metadata",()=>{
  expect(validateSourceInput(verified()).valid).toBe(true);
 });

 test.each([
  ["title",""],
  ["issuer",""],
  ["sourceDate",""],
  ["uri",""]
 ])("rejects missing %s",((field:string,value:string)=>{
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

 test("allows incomplete metadata for explicitly non-verified sources",()=>{
  expect(validateSourceInput({status:"TO_VERIFY"}).valid).toBe(true);
 });
});
