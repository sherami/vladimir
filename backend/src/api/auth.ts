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
