import { describe,expect,test } from "vitest";
import { applyEvidenceToProperty } from "../src/services/evidence.js";

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
});
