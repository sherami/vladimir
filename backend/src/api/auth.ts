import {createHash,timingSafeEqual} from "node:crypto";
import jwt from "jsonwebtoken";
import type { Request,Response,NextFunction } from "express";
export type Role="ADMIN"|"ANALYST"|"ADVISOR"|"EDITOR"|"VIEWER";
export interface Principal{ sub:string; email:string; role:Role; }
declare global { namespace Express { interface Request { principal?:Principal } } }
function requiredEnv(name:string,minLength=1){
 const value=process.env[name];
 if(!value || value.length<minLength) throw new Error(`${name} must be configured${minLength>1?` and at least ${minLength} characters`:""}`);
 return value;
}
function jwtConfig(){
 return {
  secret:requiredEnv("JWT_SECRET",16),
  issuer:requiredEnv("JWT_ISSUER"),
  audience:requiredEnv("JWT_AUDIENCE")
 };
}
function secureEqual(a:string,b:string){
 const ah=createHash("sha256").update(a).digest();
 const bh=createHash("sha256").update(b).digest();
 return timingSafeEqual(ah,bh);
}
export function issueWorkspaceSession(email:string,role:Role="ADMIN"){
 const normalized=email.trim().toLowerCase();
 const config=jwtConfig();
 const principal:Principal={sub:`workspace:${normalized}`,email:normalized,role};
 const token=jwt.sign({email:principal.email,role:principal.role},config.secret,{
  subject:principal.sub,issuer:config.issuer,audience:config.audience,expiresIn:"8h"
 });
 return {token,principal,expiresInSeconds:8*60*60};
}
// Environment-password login remains as a staging fallback while persistent
// credentials are rolled out. New deployments should prefer the DB-backed path.
export function loginWorkspace(email:string,password:string){
 const configuredEmail=requiredEnv("WORKSPACE_AUTH_EMAIL");
 const configuredPassword=requiredEnv("WORKSPACE_AUTH_PASSWORD",12);
 if(!secureEqual(email.trim().toLowerCase(),configuredEmail.trim().toLowerCase())||!secureEqual(password,configuredPassword)) return null;
 return issueWorkspaceSession(configuredEmail,"ADMIN");
}
export function authenticate(req:Request,res:Response,next:NextFunction){
 const h=req.header("authorization"); if(!h?.startsWith("Bearer ")) return res.status(401).json({error:"unauthorized"});
 try{
  const config=jwtConfig();
  req.principal=jwt.verify(h.slice(7),config.secret,{issuer:config.issuer,audience:config.audience}) as Principal;
  next();
 }catch{return res.status(401).json({error:"invalid_token"});}
}
export function allow(...roles:Role[]){return (req:Request,res:Response,next:NextFunction)=>{
 if(!req.principal||!roles.includes(req.principal.role))return res.status(403).json({error:"forbidden"}); next();
}}
