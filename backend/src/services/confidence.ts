import type { DataStatus, EvidenceRecord } from "../domain/types.js";

export const STATUS_CONFIDENCE:Record<DataStatus,number> = {
  VERIFIED_DOCUMENT:100,
  ACTUAL:100,
  MARKET_DATA:85,
  DEVELOPER_MODEL:70,
  PP_ESTIMATE:60,
  DEVELOPER_CLAIM:45,
  ASSUMPTION:40,
  TO_VERIFY:0
};

export const CATEGORY_WEIGHTS = Object.freeze({
  purchaseEntryValue:.15,
  ownershipLegal:.15,
  acquisitionCosts:.10,
  rentalRevenueNoi:.20,
  operatingExpenses:.10,
  paymentScheduleTiming:.10,
  exitGrowthMarketValue:.10,
  exitCosts:.05,
  developerDelivery:.05
});

type Category=keyof typeof CATEGORY_WEIGHTS;

const FIELD_CATEGORY:Record<string,Category> = {
  purchasePrice:"purchaseEntryValue",
  entryMarketValue:"purchaseEntryValue",
  ownershipType:"ownershipLegal",
  titleStatus:"ownershipLegal",
  legalStatus:"ownershipLegal",
  acquisitionCosts:"acquisitionCosts",
  initialCapex:"acquisitionCosts",
  annualNoi:"rentalRevenueNoi",
  rentalRevenue:"rentalRevenueNoi",
  operatingExpenses:"operatingExpenses",
  datedCashFlows:"paymentScheduleTiming",
  paymentSchedule:"paymentScheduleTiming",
  exitGrowthRate:"exitGrowthMarketValue",
  exitMarketValue:"exitGrowthMarketValue",
  sellingCostRate:"exitCosts",
  exitCosts:"exitCosts",
  developerStatus:"developerDelivery",
  developerDelivery:"developerDelivery"
};

export interface ConfidenceResult {
  score:number;
  criticalToVerify:boolean;
  byField:Record<string,{status:DataStatus;confidence:number;critical:boolean;category?:Category}>;
  byCategory:Record<string,{weight:number;confidence:number;fields:string[]}>;
}

export function calculateEvidenceConfidence(records:EvidenceRecord[]):ConfidenceResult {
  const latestByField = new Map<string,EvidenceRecord>();
  for (const r of records) {
    const prev = latestByField.get(r.field);
    if (!prev || String(prev.createdAt ?? "") <= String(r.createdAt ?? "")) latestByField.set(r.field,r);
  }

  let criticalToVerify=false;
  const byField:ConfidenceResult["byField"]={};
  const categoryValues = new Map<Category,{sum:number;count:number;fields:string[]}>();

  for(const [field,r] of latestByField){
    const confidence=STATUS_CONFIDENCE[r.status];
    const critical=!!r.isCritical;
    const category=FIELD_CATEGORY[field];
    if(critical && r.status==="TO_VERIFY") criticalToVerify=true;
    byField[field]={status:r.status,confidence,critical,category};
    if(category){
      const v=categoryValues.get(category)??{sum:0,count:0,fields:[]};
      v.sum+=confidence; v.count+=1; v.fields.push(field); categoryValues.set(category,v);
    }
  }

  let score=0;
  const byCategory:ConfidenceResult["byCategory"]={};
  for(const [category,weight] of Object.entries(CATEGORY_WEIGHTS) as [Category,number][]){
    const v=categoryValues.get(category);
    const categoryConfidence=v ? v.sum/v.count : 0; // missing category contributes 0
    score += categoryConfidence*weight;
    byCategory[category]={weight,confidence:categoryConfidence,fields:v?.fields??[]};
  }

  return {score,criticalToVerify,byField,byCategory};
}
