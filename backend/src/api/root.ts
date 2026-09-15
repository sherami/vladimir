import express from "express";
import {app} from "./app.js";
import {httpBoundary} from "./http-boundary.js";
import {issueWorkspaceSession,loginWorkspace} from "./auth.js";
import {authenticateWorkspaceUser,bootstrapWorkspaceUser,workspaceUserCount} from "../services/workspace-auth.js";

export const rootApp=express();
rootApp.use(httpBoundary);
rootApp.use(express.json());

rootApp.get("/api/v1/auth/status",async(_req,res)=>{
 try{return res.json({initialized:(await workspaceUserCount())>0});}
 catch{return res.status(503).json({error:"auth_store_unavailable"});}
});

rootApp.post("/api/v1/auth/bootstrap",async(req,res)=>{
 try{
  const email=typeof req.body?.email==="string"?req.body.email:"";
  const password=typeof req.body?.password==="string"?req.body.password:"";
  const bootstrapToken=typeof req.body?.bootstrapToken==="string"?req.body.bootstrapToken:"";
  if(!email||!password||!bootstrapToken)return res.status(400).json({error:"bootstrap_fields_required"});
  const user=await bootstrapWorkspaceUser(email,password,bootstrapToken);
  const session=issueWorkspaceSession(user.email,user.role);
  return res.status(201).json({token:session.token,tokenType:"Bearer",expiresInSeconds:session.expiresInSeconds,user});
 }catch(error){
  const message=error instanceof Error?error.message:"";
  if(message==="workspace_already_initialized")return res.status(409).json({error:message});
  if(message==="invalid_bootstrap_credentials")return res.status(401).json({error:message});
  if(message==="password_too_short")return res.status(400).json({error:message});
  if(message==="bootstrap_not_configured")return res.status(503).json({error:message});
  return res.status(500).json({error:"bootstrap_failed"});
 }
});

rootApp.post("/api/v1/auth/login",async(req,res)=>{
 try{
  const email=typeof req.body?.email==="string"?req.body.email:"";
  const password=typeof req.body?.password==="string"?req.body.password:"";
  if(!email||!password)return res.status(400).json({error:"credentials_required"});
  const dbUser=await authenticateWorkspaceUser(email,password);
  const session=dbUser?issueWorkspaceSession(dbUser.email,dbUser.role):loginWorkspace(email,password);
  if(!session)return res.status(401).json({error:"invalid_credentials"});
  return res.json({token:session.token,tokenType:"Bearer",expiresInSeconds:session.expiresInSeconds,user:{email:session.principal.email,role:session.principal.role}});
 }catch(error){
  const message=error instanceof Error?error.message:"";
  if(message.includes("WORKSPACE_AUTH_PASSWORD must be configured"))return res.status(401).json({error:"invalid_credentials"});
  if(message.includes("must be configured"))return res.status(503).json({error:"auth_not_configured"});
  return res.status(500).json({error:"auth_failed"});
 }
});

rootApp.use(app);
