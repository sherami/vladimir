import {describe,expect,test} from "vitest";
import {canTransition} from "../src/domain/workflow.js";
describe("workflow",()=>{
 test("valid path",()=>expect(canTransition("DRAFT","VERIFICATION")).toBe(true));
 test("cannot publish directly from draft",()=>expect(canTransition("DRAFT","PUBLISHED")).toBe(false));
 test("published only supersedes",()=>{expect(canTransition("PUBLISHED","SUPERSEDED")).toBe(true);expect(canTransition("PUBLISHED","VERIFICATION")).toBe(false);});
});
