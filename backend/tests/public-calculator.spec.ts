import {describe,expect,test} from "vitest";
import {calculatePublicScenario,validatePublicCalculatorInput} from "../src/services/public-calculator.js";

const input=()=>({
 purchasePrice:8_591_740,acquisitionCosts:142_299,initialCapex:560_000,
 annualNoi:749_745,entryMarketValue:8_591_740,holdingYears:5,
 exitGrowthRate:.06,sellingCostRate:.06,requiredReturn:.08
});

describe("public investment calculator",()=>{
 test("uses the production TAC, net-yield, exit-value and IRR primitives",()=>{
  const result=calculatePublicScenario(input());
  expect(result.status).toBe("SCENARIO_ONLY");
  expect(result.outputs.tac).toBeCloseTo(9_294_039,6);
  expect(result.outputs.netYield).toBeCloseTo(.0806694472,8);
  expect(result.outputs.productionReturnMetric).toBe("IRR");
  expect(result.outputs.requiredReturnGap).toBeCloseTo(result.outputs.productionReturn-.08,10);
  expect(result.disclosure).toContain("does not change");
 });

 test("rejects invalid ranges instead of coercing missing values to zero",()=>{
  const invalid={...input(),annualNoi:undefined,holdingYears:2.5,sellingCostRate:1};
  const result=validatePublicCalculatorInput(invalid);
  expect(result.valid).toBe(false);
  expect(result.issues).toContain("annualNoi must be a finite number");
  expect(result.issues).toContain("holdingYears must be a whole number from 1 to 30");
  expect(result.issues).toContain("sellingCostRate must be at least 0 and below 1");
 });

 test("never mutates published score or verdict because neither is an input or output",()=>{
  const result=calculatePublicScenario(input());
  expect(result.outputs).not.toHaveProperty("riskAdjustedScore");
  expect(result.outputs).not.toHaveProperty("finalVerdict");
 });
});
