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

function publicAnalytics(run:any){
 return {
  calculationRunId:run.calculationRunId??null,
  engineVersion:run.engineVersion??null,
  methodologyVersion:run.methodologyVersion??null,
  inputSnapshotHash:run.inputSnapshotHash??null,
  tac:run.tac??null,
  noi:run.noi??null,
  netYield:run.netYield??null,
  productionReturnMetric:run.productionReturnMetric??null,
  productionReturn:run.productionReturn??null,
  exitValue:run.exitValue??null,
  netExitProceeds:run.netExitProceeds??null,
  periodicCashFlows:run.periodicCashFlows??null,
  scenarios:run.scenarios??null,
  riskAdjustedScore:run.riskAdjustedScore??null,
  riskLabel:run.riskLabel??null,
  dataConfidence:run.financialDataConfidence??run.dataConfidence?.score??run.dataConfidence??null,
  verdictStatus:run.verdictStatus??null,
  finalVerdict:run.finalVerdict??null
 };
}

export function toPublicPublicationSnapshot(snapshot:any){
 const property=snapshot?.property??{};
 return {
  property:{
   id:property.id??null,project:property.project??null,unit:property.unit??null,
   purchasePrice:property.purchasePrice?{value:property.purchasePrice.value??null,status:property.purchasePrice.status??null}:null,
   annualNoi:property.annualNoi?{value:property.annualNoi.value??null,status:property.annualNoi.status??null}:null
  },
  analytics:publicAnalytics(snapshot?.analytics??{}),
  narrative:snapshot?.narrative??null,
  sourceDisclosures:sanitizePublicDisclosure(snapshot?.sourceDisclosures??[]),
  scenarioDisclosures:sanitizePublicDisclosure(snapshot?.scenarioDisclosures??[]),
  frozenAt:snapshot?.frozenAt??null
 };
}

export function buildPublicationSnapshot(property:any,run:any,draft:any){
 return toPublicPublicationSnapshot({
  property:{
   id:property.id,project:property.project,unit:property.unit??null,
   purchasePrice:property.purchasePrice??null,annualNoi:property.annualNoi??null
  },
  analytics:run,
  narrative:{
   headline:draft.headline,summary:draft.summary,whyBuy:draft.why_buy,whyNotBuy:draft.why_not_buy,
   bestFor:draft.best_for,notSuitableFor:draft.not_suitable_for
  },
  sourceDisclosures:draft.source_disclosures,
  scenarioDisclosures:draft.scenario_disclosures,
  frozenAt:new Date().toISOString()
 });
}
