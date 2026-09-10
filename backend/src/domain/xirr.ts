import { Decimal } from "decimal.js";
import type { DatedCashFlow } from "./types.js";

const DAY_MS=86400000;
function daysBetween(a:string,b:string){ return (Date.parse(b)-Date.parse(a))/DAY_MS; }

export function xnpv(rate:number, flows:DatedCashFlow[]) {
 if(rate<=-1) throw new Error("rate must be > -1");
 if(flows.length<2) throw new Error("at least two dated cash flows required");
 const sorted=[...flows].sort((a,b)=>a.date.localeCompare(b.date));
 const d0=sorted[0].date;
 return sorted.reduce((sum,cf)=>{
   const years=daysBetween(d0,cf.date)/365;
   return sum.plus(new Decimal(cf.amount).div(new Decimal(1+rate).pow(years)));
 },new Decimal(0)).toNumber();
}

export function xirr(flows:DatedCashFlow[], guess=.10, tolerance=1e-10, maxIterations=200) {
 if(!flows.some(f=>f.amount<0) || !flows.some(f=>f.amount>0))
   throw new Error("XIRR requires at least one negative and one positive cash flow");

 // Deterministic bisection: safer than relying only on Newton-Raphson.
 let low=-0.9999, high=10;
 let fLow=xnpv(low,flows), fHigh=xnpv(high,flows);
 while(fLow*fHigh>0 && high<1e6){ high*=2; fHigh=xnpv(high,flows); }
 if(fLow*fHigh>0) throw new Error("Unable to bracket XIRR root");

 for(let i=0;i<maxIterations;i++){
   const mid=(low+high)/2, fMid=xnpv(mid,flows);
   if(Math.abs(fMid)<tolerance || Math.abs(high-low)<tolerance) return mid;
   if(fLow*fMid<=0){ high=mid; fHigh=fMid; } else { low=mid; fLow=fMid; }
 }
 throw new Error("XIRR did not converge");
}
