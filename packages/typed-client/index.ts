export type DataStatus="VERIFIED_DOCUMENT"|"ACTUAL"|"MARKET_DATA"|"DEVELOPER_MODEL"|"PP_ESTIMATE"|"DEVELOPER_CLAIM"|"ASSUMPTION"|"TO_VERIFY";
export type VerdictStatus="FINAL"|"PROVISIONAL"|"BLOCKED";
export interface PublishedAnalytics{
 calculationRunId:string; propertyId:string; engineVersion:string; methodologyVersion:string; inputSnapshotHash:string;
 tac:number; noi:number|null; netYield:number|null; productionReturnMetric:"XIRR"|"NET_YIELD"|null;
 productionReturn:number|null; riskAdjustedScore:number|null; finalVerdict:string|null; verdictStatus:VerdictStatus;
}
export interface PublishedPropertyResponse{publication:{calculation_run_id:string;published_at:string};analytics:PublishedAnalytics}
