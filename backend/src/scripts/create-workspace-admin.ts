import {randomBytes,scrypt as scryptCb} from "node:crypto";
import {promisify} from "node:util";
import {createInterface} from "node:readline/promises";
import {stdin as input,stdout as output} from "node:process";
import {pool} from "../db/pool.js";

const scrypt=promisify(scryptCb);
const KEYLEN=64;

async function hashPassword(password:string){
 if(password.length<12)throw new Error("Password must be at least 12 characters.");
 const salt=randomBytes(16).toString("hex");
 const derived=await scrypt(password,salt,KEYLEN) as Buffer;
 return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function main(){
 const rl=createInterface({input,output});
 try{
  const existing=await pool.query("select count(*)::int as count from pp_workspace_users");
  if(Number(existing.rows[0]?.count??0)>0)throw new Error("Workspace is already initialized; refusing to create another bootstrap admin.");

  const configuredEmail=process.env.WORKSPACE_AUTH_EMAIL?.trim().toLowerCase();
  const enteredEmail=(await rl.question(configuredEmail?`Admin email [${configuredEmail}]: `:"Admin email: ")).trim().toLowerCase();
  const email=enteredEmail||configuredEmail;
  if(!email||!email.includes("@"))throw new Error("A valid admin email is required.");
  if(configuredEmail&&email!==configuredEmail)throw new Error("Email must match WORKSPACE_AUTH_EMAIL.");

  const password=await rl.question("New password (input may be visible in Render Shell; clear terminal history afterwards): ");
  const confirm=await rl.question("Confirm password: ");
  if(password!==confirm)throw new Error("Passwords do not match.");
  const passwordHash=await hashPassword(password);

  await pool.query("insert into pp_workspace_users(email,password_hash,role) values($1,$2,'ADMIN')",[email,passwordHash]);
  output.write(`Workspace ADMIN created for ${email}.\n`);
 }finally{
  rl.close();
  await pool.end();
 }
}

main().catch((error)=>{
 console.error(error instanceof Error?error.message:error);
 process.exitCode=1;
});
