import {createHash,randomBytes,scrypt as scryptCb,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {pool} from "../db/pool.js";
import type {Role} from "../api/auth.js";

const scrypt=promisify(scryptCb);
const KEYLEN=64;
// One-time bootstrap credential: only its SHA-256 digest is stored in source.
// The bootstrap route permanently refuses initialization once any workspace user exists.
const FALLBACK_BOOTSTRAP_TOKEN_SHA256="cb96555766daf47da43b09f05d1a43087a35aeadee90ed22b92fcee499b7fc83";

async function hashPassword(password:string){
 if(password.length<12)throw new Error("password_too_short");
 const salt=randomBytes(16).toString("hex");
 const derived=await scrypt(password,salt,KEYLEN) as Buffer;
 return `scrypt$${salt}$${derived.toString("hex")}`;
}
async function verifyPassword(password:string,encoded:string){
 const [scheme,salt,hex]=encoded.split("$");
 if(scheme!=="scrypt"||!salt||!hex)return false;
 const expected=Buffer.from(hex,"hex");
 const actual=await scrypt(password,salt,expected.length) as Buffer;
 return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
function matchesBootstrapToken(token:string){
 const configuredToken=process.env.WORKSPACE_BOOTSTRAP_TOKEN;
 if(configuredToken){
  const expected=createHash("sha256").update(configuredToken).digest();
  const actual=createHash("sha256").update(token).digest();
  return timingSafeEqual(expected,actual);
 }
 const expected=Buffer.from(FALLBACK_BOOTSTRAP_TOKEN_SHA256,"hex");
 const actual=createHash("sha256").update(token).digest();
 return timingSafeEqual(expected,actual);
}
export async function workspaceUserCount(){
 const r=await pool.query("select count(*)::int as count from pp_workspace_users");
 return Number(r.rows[0]?.count??0);
}
export async function bootstrapWorkspaceUser(email:string,password:string,token:string){
 const configuredEmail=process.env.WORKSPACE_AUTH_EMAIL?.trim().toLowerCase();
 if(!configuredEmail)throw new Error("bootstrap_not_configured");
 if(await workspaceUserCount())throw new Error("workspace_already_initialized");
 if(email.trim().toLowerCase()!==configuredEmail||!matchesBootstrapToken(token))throw new Error("invalid_bootstrap_credentials");
 const passwordHash=await hashPassword(password);
 await pool.query("insert into pp_workspace_users(email,password_hash,role) values($1,$2,'ADMIN')",[configuredEmail,passwordHash]);
 return {email:configuredEmail,role:"ADMIN" as Role};
}
export async function authenticateWorkspaceUser(email:string,password:string){
 const normalized=email.trim().toLowerCase();
 const r=await pool.query("select email,password_hash,role from pp_workspace_users where email=$1",[normalized]);
 const row=r.rows[0];
 if(!row||!(await verifyPassword(password,row.password_hash)))return null;
 return {email:String(row.email),role:String(row.role) as Role};
}
