import {describe,expect,test} from "vitest";
import {buildScenarios} from "../src/domain/scenarios.js";

describe("scenario engine",()=>{
  test("builds BASE, DOWNSIDE and SEVERE without mutating TAC",()=>{
    const outputs=buildScenarios({
      tac:10_000_000,
      annualNoi:700_000,
      entryMarketValue:9_000_000,
      exitGrowthRate:.05,
      sellingCostRate:.06,
      holdingYears:5
    });
    expect(outputs.map(x=>x.code)).toEqual(["BASE","DOWNSIDE","SEVERE"]);
    expect(outputs[0].cashFlows[0]).toBe(-10_000_000);
    expect(outputs[1].cashFlows[0]).toBe(-10_000_000);
    expect(outputs[2].cashFlows[0]).toBe(-10_000_000);
    expect(outputs[1].noi).toBe(560_000);
    expect(outputs[2].noi).toBe(455_000);
    expect(outputs[1].exitValue).toBeCloseTo(outputs[0].exitValue*.90,6);
    expect(outputs[2].exitValue).toBeCloseTo(outputs[0].exitValue*.80,6);
    expect(outputs[0].irr).toBeGreaterThan(outputs[1].irr);
    expect(outputs[1].irr).toBeGreaterThan(outputs[2].irr);
  });

  test("marks simplified stress assumptions explicitly as MODEL proxies",()=>{
    const outputs=buildScenarios({tac:1_000_000,annualNoi:80_000,entryMarketValue:900_000,exitGrowthRate:.04,sellingCostRate:.06,holdingYears:3});
    expect(outputs[1].assumptions.note).toContain("Simplified NOI stress proxy");
    expect(outputs[2].assumptions.note).toContain("Simplified NOI stress proxy");
  });
});
