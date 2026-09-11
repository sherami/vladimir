export type DataStatus =
  | "VERIFIED_DOCUMENT" | "ACTUAL" | "MARKET_DATA" | "DEVELOPER_MODEL"
  | "PP_ESTIMATE" | "DEVELOPER_CLAIM" | "ASSUMPTION" | "TO_VERIFY";

export type WorkflowState =
  | "DRAFT" | "VERIFICATION" | "READY_TO_CALCULATE" | "CALCULATED"
  | "ANALYST_REVIEW" | "READY_TO_PUBLISH" | "PUBLISHED" | "SUPERSEDED";

export type Verdict = "BUY" | "CONSIDER" | "WATCH" | "PASS";
export type VerdictStatus = "FINAL" | "PROVISIONAL" | "BLOCKED";

export interface Evidence<T=unknown> {
  value: T; status: DataStatus; sourceId?: string; asOf?: string; analystComment?: string;
}
export interface DatedCashFlow {
  date: string;
  amount: number;
  dateStatus?: "EXACT_DATE"|"MONTH_KNOWN"|"TO_VERIFY";
}
export interface ScoreInputs {
  rentalEconomics:number; value:number; capitalGrowth:number; liquidity:number;
  location:number; supply:number; developer:number; legal:number; riskScore:number;
}
export interface ConfidenceFieldBreakdown {
  status:DataStatus;
  confidence:number;
  critical:boolean;
  category?:string;
}
export interface ConfidenceCategoryBreakdown {
  weight:number;
  confidence:number;
  fields:string[];
}
export interface DataConfidenceBreakdown {
  byField:Record<string,ConfidenceFieldBreakdown>;
  byCategory:Record<string,ConfidenceCategoryBreakdown>;
}
export interface Property {
  id:string; project:string; unit?:string; workflow:WorkflowState;
  purchasePrice?:Evidence<number>; ownershipType?:Evidence<string>;
  acquisitionCosts?:Evidence<number>; initialCapex?:Evidence<number>;
  annualNoi?:Evidence<number>; entryMarketValue?:Evidence<number>;
  holdingYears?:number; exitGrowthRate?:number; sellingCostRate?:number;
  requiredReturn?:number; dataConfidence?:number; dataConfidenceBreakdown?:DataConfidenceBreakdown; criticalToVerify?:boolean;
  isOffPlan?:boolean; datedCashFlows?:DatedCashFlow[]; scores?:ScoreInputs;
}

export type EvidenceField =
  | "purchasePrice" | "ownershipType" | "acquisitionCosts" | "initialCapex"
  | "annualNoi" | "entryMarketValue" | "holdingYears" | "exitGrowthRate"
  | "sellingCostRate" | "requiredReturn" | "dataConfidence" | "isOffPlan"
  | "datedCashFlows" | "paymentSchedule" | "operatingExpenses"
  | "developerStatus" | "developerDelivery" | "titleStatus" | "legalStatus"
  | string;

export interface SourceRecord {
  id:string;
  propertyId:string;
  documentType:string;
  issuer?:string;
  sourceDate?:string;
  receivedAt?:string;
  status:DataStatus;
  title?:string;
  uri?:string;
  metadata?:Record<string,unknown>;
}

export interface EvidenceRecord {
  id:string;
  propertyId:string;
  field:EvidenceField;
  value:unknown;
  unit?:string;
  status:DataStatus;
  sourceId?:string;
  asOf?:string;
  analystComment?:string;
  isCritical?:boolean;
  createdBy:string;
  createdAt?:string;
  supersedesId?:string;
}

export type VerificationState = "OPEN" | "RESOLVED" | "WAIVED";

export interface VerificationItem {
  id:string;
  propertyId:string;
  field?:string;
  severity:"BLOCKER"|"WARNING"|"INFO";
  code:string;
  message:string;
  state:VerificationState;
  sourceId?:string;
  resolutionComment?:string;
  resolvedBy?:string;
  resolvedAt?:string;
  createdAt?:string;
}
