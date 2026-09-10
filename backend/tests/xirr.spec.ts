import { describe,expect,test } from "vitest";
import { xirr,xnpv } from "../src/domain/xirr.js";

describe("XIRR",()=>{
 test("annual -1000/+1100 is approximately 10%",()=>{
  const flows=[{date:"2026-01-01",amount:-1000},{date:"2027-01-01",amount:1100}];
  const r=xirr(flows);
  expect(r).toBeCloseTo(.10,8);
  expect(xnpv(r,flows)).toBeCloseTo(0,7);
 });
 test("requires both signs",()=>{
  expect(()=>xirr([{date:"2026-01-01",amount:-100},{date:"2027-01-01",amount:-10}])).toThrow();
 });
});
