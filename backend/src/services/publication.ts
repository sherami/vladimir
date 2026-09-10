export function validateNarrative(d:any){
 const issues:string[]=[];
 if(!d) issues.push("publication narrative missing");
 if(!d?.summary?.trim()) issues.push("summary required");
 if(!Array.isArray(d?.why_buy)||d.why_buy.length===0) issues.push("at least one Why Buy item required");
 if(!Array.isArray(d?.why_not_buy)||d.why_not_buy.length===0) issues.push("at least one Why Not Buy item required");
 return issues;
}
export function buildPublicationSnapshot(property:any,run:any,draft:any){
 return {
  property:{id:property.id,project:property.project,unit:property.unit??null},
  analytics:run,
  narrative:{
   headline:draft.headline,summary:draft.summary,whyBuy:draft.why_buy,whyNotBuy:draft.why_not_buy,
   bestFor:draft.best_for,notSuitableFor:draft.not_suitable_for
  },
  sourceDisclosures:draft.source_disclosures,
  scenarioDisclosures:draft.scenario_disclosures,
  frozenAt:new Date().toISOString()
 };
}
