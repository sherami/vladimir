import jwt from "jsonwebtoken";
import type { Request,Response,NextFunction } from "express";
export type Role="ADMIN"|"ANALYST"|"ADVISOR"|"EDITOR"|"VIEWER";
export interface Principal{ sub:string; email:string; role:Role; }
declare global { namespace Express { interface Request { principal?:Principal } } }
function jwtSecret(){
 const secret=process.env.JWT_SECRET;
 if(!secret || secret.length<16) throw new Error("JWT_SECRET must be configured and at least 16 characters");
 return secret;
}
export function authenticate(req:Request,res:Response,next:NextFunction){
 const h=req.header("authorization"); if(!h?.startsWith("Bearer ")) return res.status(401).json({error:"unauthorized"});
 try{ req.principal=jwt.verify(h.slice(7),jwtSecret()) as Principal; next(); }catch{return res.status(401).json({error:"invalid_token"});}
}
export function allow(...roles:Role[]){return (req:Request,res:Response,next:NextFunction)=>{
 if(!req.principal||!roles.includes(req.principal.role))return res.status(403).json({error:"forbidden"}); next();
}}
