import type {NextFunction,Request,Response} from "express";

type Clock=()=>number;
type Bucket={count:number;resetAt:number};

function positiveInteger(value:string|undefined,fallback:number){
 const parsed=Number(value);
 return Number.isInteger(parsed)&&parsed>0?parsed:fallback;
}

export function createRateLimit(options:{limit:number;windowMs:number;clock?:Clock}){
 const buckets=new Map<string,Bucket>();
 const clock=options.clock??Date.now;
 return (req:Request,res:Response,next:NextFunction)=>{
  const now=clock();
  const key=req.ip||req.socket.remoteAddress||"unknown";
  let bucket=buckets.get(key);
  if(!bucket||bucket.resetAt<=now){bucket={count:0,resetAt:now+options.windowMs};buckets.set(key,bucket);}
  bucket.count++;
  const remaining=Math.max(0,options.limit-bucket.count);
  const resetSeconds=Math.max(1,Math.ceil((bucket.resetAt-now)/1000));
  res.setHeader("RateLimit-Limit",String(options.limit));
  res.setHeader("RateLimit-Remaining",String(remaining));
  res.setHeader("RateLimit-Reset",String(resetSeconds));
  if(bucket.count>options.limit){
   res.setHeader("Retry-After",String(resetSeconds));
   return res.status(429).json({error:"rate_limit_exceeded",retryAfterSeconds:resetSeconds});
  }
  if(buckets.size>10_000){
   for(const [entryKey,entry] of buckets)if(entry.resetAt<=now)buckets.delete(entryKey);
  }
  next();
 };
}

export const publicReadLimit=createRateLimit({
 limit:positiveInteger(process.env.PUBLIC_READ_RATE_LIMIT,120),windowMs:60_000
});

export const publicCalculatorLimit=createRateLimit({
 limit:positiveInteger(process.env.PUBLIC_CALCULATOR_RATE_LIMIT,20),windowMs:60_000
});

export function publicCache(_req:Request,res:Response,next:NextFunction){
 res.setHeader("Cache-Control","public, max-age=60, s-maxage=300, stale-while-revalidate=60");
 next();
}

export function noStore(_req:Request,res:Response,next:NextFunction){
 res.setHeader("Cache-Control","no-store");
 next();
}
