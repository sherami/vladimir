import "./bootstrap.css";

const BASE=import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
const TOKEN_KEY="pp_token";

async function authStatus(){
 try{const r=await fetch(`${BASE}/auth/status`);return r.ok?await r.json():{initialized:true};}
 catch{return {initialized:true};}
}
function mount(html:string){const root=document.getElementById("root");if(!root)throw new Error("root element missing");root.innerHTML=html;}
function card(title:string,description:string,fields:string,button:string){return `<main class="login-shell"><section class="login-card"><div class="login-brand">PP <span>PrivatePhuket</span></div><div class="login-eyebrow">Analyst Workspace</div><h1>${title}</h1><p>${description}</p><form id="auth-form">${fields}<div id="login-error" class="login-error" aria-live="polite"></div><button id="login-submit" type="submit">${button}</button></form></section></main>`;}
function field(label:string,id:string,type:string,autocomplete:string){return `<label>${label}<input id="${id}" type="${type}" autocomplete="${autocomplete}" required /></label>`;}

function showLogin(){
 mount(card("Sign in","Restricted analytical workspace.",field("Email","login-email","email","username")+field("Password","login-password","password","current-password"),"Sign in"));
 const form=document.getElementById("auth-form") as HTMLFormElement,submit=document.getElementById("login-submit") as HTMLButtonElement,error=document.getElementById("login-error") as HTMLDivElement;
 form.addEventListener("submit",async event=>{event.preventDefault();error.textContent="";submit.disabled=true;submit.textContent="Signing in…";
  const email=(document.getElementById("login-email") as HTMLInputElement).value.trim(),password=(document.getElementById("login-password") as HTMLInputElement).value;
  try{const response=await fetch(`${BASE}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error("Invalid email or password.");if(typeof body.token!=="string")throw new Error("Server did not return an access token.");localStorage.setItem(TOKEN_KEY,body.token);location.reload();}
  catch(e){error.textContent=e instanceof Error?e.message:"Sign in failed.";submit.disabled=false;submit.textContent="Sign in";}
 });
}
function showSetup(){
 mount(card("First-time setup","Create the first administrator. The password is hashed before it is stored; the one-time setup token is disabled after initialization.",field("Administrator email","login-email","email","username")+field("New password (12+ characters)","login-password","password","new-password")+field("One-time setup token","bootstrap-token","password","off"),"Create administrator"));
 const form=document.getElementById("auth-form") as HTMLFormElement,submit=document.getElementById("login-submit") as HTMLButtonElement,error=document.getElementById("login-error") as HTMLDivElement;
 form.addEventListener("submit",async event=>{event.preventDefault();error.textContent="";submit.disabled=true;submit.textContent="Creating…";
  const email=(document.getElementById("login-email") as HTMLInputElement).value.trim(),password=(document.getElementById("login-password") as HTMLInputElement).value,bootstrapToken=(document.getElementById("bootstrap-token") as HTMLInputElement).value;
  try{const response=await fetch(`${BASE}/auth/bootstrap`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,bootstrapToken})});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error==="password_too_short"?"Use at least 12 characters.":"Setup failed. Check the email and one-time token.");if(typeof body.token!=="string")throw new Error("Server did not return an access token.");localStorage.setItem(TOKEN_KEY,body.token);location.reload();}
  catch(e){error.textContent=e instanceof Error?e.message:"Setup failed.";submit.disabled=false;submit.textContent="Create administrator";}
 });
}
function addSessionControl(){const button=document.createElement("button");button.className="session-logout";button.type="button";button.textContent="Sign out";button.addEventListener("click",()=>{localStorage.removeItem(TOKEN_KEY);location.reload();});document.body.appendChild(button);}

if(localStorage.getItem(TOKEN_KEY)){addSessionControl();import("./main");}
else{authStatus().then(s=>s.initialized?showLogin():showSetup());}
