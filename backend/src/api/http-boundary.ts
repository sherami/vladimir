import type {Request,Response,NextFunction} from "express";

function configuredOrigins(){
 return (process.env.CORS_ORIGINS??"")
  .split(",")
  .map(x=>x.trim())
  .filter(Boolean);
}

function isAllowedOrigin(origin:string){
 const explicit=configuredOrigins();
 if(explicit.includes(origin)) return true;
 if(process.env.NODE_ENV!=="production" && /^https?:\/\/localhost(?::\d+)?$/.test(origin)) return true;
 return false;
}

export function httpBoundary(req:Request,res:Response,next:NextFunction){
 res.setHeader("X-Content-Type-Options","nosniff");
 res.setHeader("X-Frame-Options","DENY");
 res.setHeader("Referrer-Policy","no-referrer");
 res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
 res.setHeader("Cross-Origin-Resource-Policy","same-site");

 const origin=req.header("origin");
 if(origin && isAllowedOrigin(origin)){
  res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, OPTIONS");
  res.setHeader("Access-Control-Max-Age","600");
 }

 if(req.method==="OPTIONS"){
  if(origin && !isAllowedOrigin(origin)) return res.status(403).json({error:"cors_origin_forbidden"});
  return res.sendStatus(204);
 }
 next();
}
