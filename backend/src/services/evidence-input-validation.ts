const DATA_STATUSES=new Set([
 "VERIFIED_DOCUMENT","ACTUAL","MARKET_DATA","DEVELOPER_MODEL",
 "PP_ESTIMATE","DEVELOPER_CLAIM","ASSUMPTION","TO_VERIFY"
]);
const RESERVED_FIELDS=new Set([
 "id","project","unit","workflow","dataConfidence",
 "dataConfidenceBreakdown","criticalToVerify","scores"
]);
const NON_NEGATIVE_FIELDS=new Set([
 "acquisitionCosts","initialCapex","annualNoi","operatingExpenses"
]);
const POSITIVE_FIELDS=new Set(["purchasePrice","entryMarketValue"]);
const DATE_STATUSES=new Set(["EXACT_DATE","MONTH_KNOWN","TO_VERIFY"]);

function finiteNumber(value:unknown):value is number{
 return typeof value==="number" && Number.isFinite(value);
}
function validDate(value:unknown){
 if(typeof value!=="string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const parsed=new Date(`${value}T00:00:00.000Z`);
 return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0,10)===value;
}
function validCashFlows(value:unknown){
 return Array.isArray(value) && value.every(item=>
  item && typeof item==="object" &&
  typeof (item as any).date==="string" &&
  finiteNumber((item as any).amount) &&
  ((item as any).dateStatus===undefined || DATE_STATUSES.has((item as any).dateStatus))
 );
}

export function validateEvidenceInput(input:any){
 const issues:string[]=[];
 const field=input?.field;
 const value=input?.value;

 if(typeof field!=="string" || !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(field))
  issues.push("field must be a valid evidence field name");
 else if(RESERVED_FIELDS.has(field))
  issues.push(`${field} is a protected property field`);

 if(!DATA_STATUSES.has(input?.status))
  issues.push("status must be a supported data status");
 if(value===undefined || value===null)
  issues.push("value is required");
 if(input?.asOf!==undefined && !validDate(input.asOf))
  issues.push("asOf must be a valid YYYY-MM-DD date");

 if(POSITIVE_FIELDS.has(field) && (!finiteNumber(value) || value<=0))
  issues.push(`${field} must be a finite number greater than zero`);
 if(NON_NEGATIVE_FIELDS.has(field) && (!finiteNumber(value) || value<0))
  issues.push(`${field} must be a non-negative finite number`);
 if(field==="holdingYears" && (!finiteNumber(value) || !Number.isInteger(value) || value<=0))
  issues.push("holdingYears must be a positive whole number");
 if(field==="exitGrowthRate" && (!finiteNumber(value) || value<=-1 || value>1))
  issues.push("exitGrowthRate must be a finite decimal greater than -1 and at most 1");
 if(field==="sellingCostRate" && (!finiteNumber(value) || value<0 || value>1))
  issues.push("sellingCostRate must be a finite decimal between 0 and 1");
 if(field==="requiredReturn" && (!finiteNumber(value) || value<=-1 || value>5))
  issues.push("requiredReturn must be a finite decimal greater than -1 and at most 5");
 if(field==="ownershipType" && (typeof value!=="string" || !value.trim()))
  issues.push("ownershipType must be a non-empty string");
 if(field==="isOffPlan" && typeof value!=="boolean")
  issues.push("isOffPlan must be a boolean");
 if(field==="datedCashFlows" && !validCashFlows(value))
  issues.push("datedCashFlows must contain finite amounts, dates, and supported date statuses");
 if(field==="paymentSchedule" && !Array.isArray(value))
  issues.push("paymentSchedule must be an array");

 return issues.length
  ? {valid:false as const,error:"invalid_evidence_input",issues}
  : {valid:true as const};
}
