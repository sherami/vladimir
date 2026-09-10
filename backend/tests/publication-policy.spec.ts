import { describe,expect,test } from "vitest";
import { verdictStatus } from "../src/domain/calculation.js";
describe("publication policy",()=>{
 test("confidence below 75 remains provisional",()=>expect(verdictStatus(74,false,false,true)).toBe("PROVISIONAL"));
 test("critical TO_VERIFY remains provisional",()=>expect(verdictStatus(90,true,false,true)).toBe("PROVISIONAL"));
 test("clean run can be final",()=>expect(verdictStatus(80,false,false,true)).toBe("FINAL"));
});
