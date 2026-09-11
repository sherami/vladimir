import {describe,expect,test} from "vitest";
import {buildPublicationSnapshot,sanitizePublicDisclosure} from "../src/services/publication.js";

describe("public disclosure safety",()=>{
 test("removes private URI/path fields recursively",()=>{
   const clean=sanitizePublicDisclosure([{label:"SPA",status:"VERIFIED_DOCUMENT",uri:"s3://private/file.pdf",nested:{path:"/mnt/data/a.pdf",issuer:"Developer"}}]);
   expect(clean[0].uri).toBeUndefined();
   expect(clean[0].nested.path).toBeUndefined();
   expect(clean[0].nested.issuer).toBe("Developer");
 });
 test("redacts private filesystem-like string values",()=>{
   expect(sanitizePublicDisclosure("/mnt/data/private.pdf")).toBe("[private source reference removed]");
   expect(sanitizePublicDisclosure("https://example.com/public")).toBe("https://example.com/public");
 });
 test("publication snapshot never exposes draft source URI",()=>{
   const snapshot=buildPublicationSnapshot(
     {id:"p1",project:"Test"},
     {calculationRunId:"r1"},
     {headline:"H",summary:"S",why_buy:["x"],why_not_buy:["y"],best_for:[],not_suitable_for:[],source_disclosures:[{label:"Contract",uri:"file:///secret.pdf"}],scenario_disclosures:[]}
   );
   expect(snapshot.sourceDisclosures[0]).toEqual({label:"Contract"});
 });
});
