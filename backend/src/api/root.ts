import express from "express";
import {app} from "./app.js";
import {httpBoundary} from "./http-boundary.js";
import {loginWorkspace} from "./auth.js";

export const rootApp=express();
rootApp.use(httpBoundary);
rootApp.use(express.json());

rootApp.post("/api/v1/auth/login",(req,res)=>{
 try{
  const email=typeof req.body?.email==="string"?req.body.email:"";
  const password=typeof req.body?.password==="string"?req.body.password:"";
  if(!email||!password)return res.status(400).json({error:"credentials_required"});
  const session=loginWorkspace(email,password);
  if(!session)return res.status(401).json({error:"invalid_credentials"});
  return res.json({
   token:session.token,
   tokenType:"Bearer",
   expiresInSeconds:session.expiresInSeconds,
   user:{email:session.principal.email,role:session.principal.role}
  });
 }catch(error){
  const message=error instanceof Error?error.message:"";
  if(message.includes("must be configured"))return res.status(503).json({error:"auth_not_configured"});
  return res.status(500).json({error:"auth_failed"});
 }
});

rootApp.use(app);
