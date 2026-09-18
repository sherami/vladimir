import {randomUUID} from "node:crypto";
import type {ErrorRequestHandler,NextFunction,Request,RequestHandler,Response} from "express";

type Log=(entry:string)=>void;
const safeRequestId=/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

export function requestObservability(options:{clock?:()=>number;log?:Log}={}):RequestHandler{
 const clock=options.clock??Date.now;
 const log=options.log??(entry=>console.log(entry));
 return (req:Request,res:Response,next:NextFunction)=>{
  if(res.locals.traceId)return next();
  const incoming=req.header("x-request-id")??"";
  const traceId=safeRequestId.test(incoming)?incoming:randomUUID();
  const startedAt=clock();
  res.locals.traceId=traceId;
  res.setHeader("X-Request-Id",traceId);
  res.once("finish",()=>log(JSON.stringify({
   type:"http_request",traceId,method:req.method,path:req.path,status:res.statusCode,
   durationMs:Math.max(0,clock()-startedAt)
  })));
  next();
 };
}

export const apiErrorHandler:ErrorRequestHandler=(error,_req,res,_next)=>{
 const traceId=res.locals.traceId??randomUUID();
 console.error(JSON.stringify({
  type:"unhandled_error",traceId,errorName:error instanceof Error?error.name:"UnknownError"
 }));
 if(res.headersSent)return;
 res.status(500).json({error:"internal_error",traceId});
};
