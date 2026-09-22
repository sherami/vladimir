import {describe,expect,test} from "vitest";
import {buildPublicComparison,toPublicCatalogItem} from "../src/services/public-catalog.js";

const publication=(id:string,score:number)=>({
 property_id:id,
 published_at:"2026-09-18T00:00:00.000Z",
 snapshot:{
  property:{id,project:`Project ${id}`,unit:"A-01",purchasePrice:{value:9_500_000,status:"VERIFIED_DOCUMENT",internalSource:"private-file"},annualNoi:{value:710_000,status:"MARKET_DATA",privateNote:"do not disclose"}},
  analytics:{
   tac:10_000_000,netYield:.071,productionReturnMetric:"IRR",productionReturn:.104,
   riskAdjustedScore:score,verdictStatus:"FINAL",finalVerdict:"BUY",dataConfidence:{score:83},riskLabel:"MODERATE",methodologyVersion:"1.0",
   inputSnapshot:{private:"must not leak"}
  },
  narrative:{headline:"Independent view",summary:"Published summary"},
  sourceDisclosures:[{uri:"s3://private/document.pdf"}]
 }
});

describe("public catalog",()=>{
 test("exposes only the allowlisted comparison fields",()=>{
  const item=toPublicCatalogItem(publication("p1",78));
  expect(item.analytics).toEqual({
   tac:10_000_000,netYield:.071,productionReturnMetric:"IRR",productionReturn:.104,
   riskAdjustedScore:78,verdictStatus:"FINAL",finalVerdict:"BUY",dataConfidence:83,riskLabel:"MODERATE",methodologyVersion:"1.0"
  });
  expect(item.purchasePrice).toEqual({value:9_500_000,status:"VERIFIED_DOCUMENT"});
  expect(item.annualNoi).toEqual({value:710_000,status:"MARKET_DATA"});
  expect(item).not.toHaveProperty("snapshot");
  expect(JSON.stringify(item)).not.toContain("private");
  expect(JSON.stringify(item)).not.toContain("do not disclose");
  expect(JSON.stringify(item)).not.toContain("private-file");
  expect(JSON.stringify(item)).not.toContain("s3://");
 });

 test("does not expose a final verdict from a provisional snapshot",()=>{
  const candidate=publication("provisional",68);
  candidate.snapshot.analytics.verdictStatus="PROVISIONAL";
  const item=toPublicCatalogItem(candidate);
  expect(item.analytics.verdictStatus).toBe("PROVISIONAL");
  expect(item.analytics.finalVerdict).toBeNull();
 });

 test("preserves caller order for deterministic comparisons",()=>{
  expect(buildPublicComparison([publication("p2",70),publication("p1",80)]).map(x=>x.id))
   .toEqual(["p2","p1"]);
 });
});
