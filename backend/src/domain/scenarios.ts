import { exitValue, irr, netYield } from "./calculation.js";

export type ScenarioCode="BASE"|"DOWNSIDE"|"SEVERE";
export interface ScenarioPolicy {
  code:ScenarioCode;
  noiMultiplier:number;
  exitValueMultiplier:number;
  note:string;
}
export interface ScenarioOutput {
  code:ScenarioCode;
  noi:number;
  netYield:number;
  exitValue:number;
  netExitProceeds:number;
  irr:number;
  cashFlows:number[];
  assumptions:{noiMultiplier:number;exitValueMultiplier:number;note:string};
}

// Simplified RC5 scenario policy for properties where the engine only has annual NOI,
// not granular ADR / occupancy / operating expense inputs. These are explicit MODEL
// proxies and must not be presented as observed market facts.
export const SCENARIO_POLICIES:readonly ScenarioPolicy[]=Object.freeze([
  {code:"BASE",noiMultiplier:1,exitValueMultiplier:1,note:"Current approved model assumptions."},
  {code:"DOWNSIDE",noiMultiplier:.80,exitValueMultiplier:.90,note:"Simplified NOI stress proxy (-20%) and exit-value haircut (-10%)."},
  {code:"SEVERE",noiMultiplier:.65,exitValueMultiplier:.80,note:"Simplified NOI stress proxy (-35%) and exit-value haircut (-20%)."}
]);

export function buildScenarios(input:{
  tac:number;
  annualNoi:number;
  entryMarketValue:number;
  exitGrowthRate:number;
  sellingCostRate:number;
  holdingYears:number;
}):ScenarioOutput[]{
  const modeledBaseExit=exitValue(input.entryMarketValue,input.exitGrowthRate,input.holdingYears);
  return SCENARIO_POLICIES.map(policy=>{
    const scenarioNoi=input.annualNoi*policy.noiMultiplier;
    const scenarioExit=modeledBaseExit*policy.exitValueMultiplier;
    const netExit=scenarioExit*(1-input.sellingCostRate);
    const cashFlows=[-input.tac];
    for(let year=1;year<=input.holdingYears;year++){
      let cf=scenarioNoi;
      if(year===input.holdingYears) cf+=netExit;
      cashFlows.push(cf);
    }
    return {
      code:policy.code,
      noi:scenarioNoi,
      netYield:netYield(scenarioNoi,input.tac),
      exitValue:scenarioExit,
      netExitProceeds:netExit,
      irr:irr(cashFlows),
      cashFlows,
      assumptions:{noiMultiplier:policy.noiMultiplier,exitValueMultiplier:policy.exitValueMultiplier,note:policy.note}
    };
  });
}
