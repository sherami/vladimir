export type PublicPublication={
 property_id:string;
 published_at:string;
 snapshot:any;
};

function analytics(snapshot:any){return snapshot?.analytics??{};}

export function toPublicCatalogItem(publication:PublicPublication){
 const snapshot=publication.snapshot??{};
 const property=snapshot.property??{};
 const values=analytics(snapshot);
 return {
  id:property.id??publication.property_id,
  project:property.project??"Published property",
  unit:property.unit??null,
  headline:snapshot.narrative?.headline??null,
  summary:snapshot.narrative?.summary??null,
  publishedAt:publication.published_at,
  annualNoi:{value:property.annualNoi?.value??null,status:property.annualNoi?.status??null},
  analytics:{
   tac:values.tac??null,
   netYield:values.netYield??null,
   productionReturnMetric:values.productionReturnMetric??null,
   productionReturn:values.productionReturn??null,
   riskAdjustedScore:values.riskAdjustedScore??null,
   verdictStatus:values.verdictStatus??null,
   finalVerdict:values.verdictStatus==="FINAL"?values.finalVerdict??null:null,
   dataConfidence:values.financialDataConfidence??values.dataConfidence?.score??values.dataConfidence??null,
   riskLabel:values.riskLabel??null,
   methodologyVersion:values.methodologyVersion??null
  }
 };
}

export function buildPublicComparison(publications:PublicPublication[]){
 return publications.map(toPublicCatalogItem);
}
