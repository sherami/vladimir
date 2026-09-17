import {describe,expect,test} from "vitest";
import {isVerificationBlockerStillActive} from "../src/services/verification.js";

const item=(overrides:any={})=>({
 id:"v",propertyId:"p",severity:"BLOCKER",code:"NON_EXACT_PAYMENT_DATES",
 field:"datedCashFlows",message:"Exact dates required",state:"OPEN",...overrides
});

describe("verification blocker closure policy",()=>{
 test("active matching blocker cannot be manually closed",()=>{
  expect(isVerificationBlockerStillActive(item(),[item({id:"fresh"})])).toBe(true);
 });

 test("blocker becomes closable only after the issue disappears",()=>{
  expect(isVerificationBlockerStillActive(item(),[
   item({id:"other",code:"MISSING_PURCHASE_PRICE",field:"purchasePrice"})
  ])).toBe(false);
 });

 test("warnings remain manually resolvable",()=>{
  expect(isVerificationBlockerStillActive(item({severity:"WARNING"}),[item()])).toBe(false);
 });
});
