const PRIVATE_DISCLOSURE_KEYS=new Set([
 "uri","url","path","filePath","sourceUri","privateUri","storageKey","containerPath"
]);

export function sanitizePublicDisclosure(value:any):any{
 if(Array.isArray(value)) return value.map(sanitizePublicDisclosure);
 if(value && typeof value==="object"){
   return Object.fromEntries(
     Object.entries(value)
       .filter(([key])=>!PRIVATE_DISCLOSURE_KEYS.has(key))
       .map(([key,v])=>[key,sanitizePublicDisclosure(v)])
   );
 }
 if(typeof value==="string" && /^(file:|sandbox:|s3:|gs:|\/mnt\/|\/home\/)/i.test(value)) return "[private source reference removed]";
 return value;
}

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
  sourceDisclosures:sanitizePublicDisclosure(draft.source_disclosures),
  scenarioDisclosures:sanitizePublicDisclosure(draft.scenario_disclosures),
  frozenAt:new Date().toISOString()
 };
}
