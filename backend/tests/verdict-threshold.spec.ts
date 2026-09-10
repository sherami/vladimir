import {describe,expect,test} from "vitest";
import {provisionalVerdict} from "../src/domain/calculation.js";

describe("verdict threshold",()=>{
 test("CONSIDER threshold is required return minus 2pp",()=>{
   expect(provisionalVerdict(75,.0599,.08)).toBe("WATCH");
   expect(provisionalVerdict(75,.06,.08)).toBe("CONSIDER");
 });
 test("BUY still requires required return",()=>{
   expect(provisionalVerdict(85,.0799,.08)).toBe("CONSIDER");
   expect(provisionalVerdict(85,.08,.08)).toBe("BUY");
 });
});
