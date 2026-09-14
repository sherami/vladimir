import "./bootstrap.css";

const BASE=import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
const TOKEN_KEY="pp_token";

function showLogin(){
 const root=document.getElementById("root");
 if(!root)throw new Error("root element missing");
 root.innerHTML=`
  <main class="login-shell">
   <section class="login-card">
    <div class="login-brand">PP <span>PrivatePhuket</span></div>
    <div class="login-eyebrow">Analyst Workspace</div>
    <h1>Sign in</h1>
    <p>Restricted analytical workspace. Use the credentials configured for this staging environment.</p>
    <form id="login-form">
     <label>Email<input id="login-email" type="email" autocomplete="username" required /></label>
     <label>Password<input id="login-password" type="password" autocomplete="current-password" required /></label>
     <div id="login-error" class="login-error" aria-live="polite"></div>
     <button id="login-submit" type="submit">Sign in</button>
    </form>
   </section>
  </main>`;
 const form=document.getElementById("login-form") as HTMLFormElement;
 const submit=document.getElementById("login-submit") as HTMLButtonElement;
 const error=document.getElementById("login-error") as HTMLDivElement;
 form.addEventListener("submit",async(event)=>{
  event.preventDefault();
  error.textContent="";
  submit.disabled=true;
  submit.textContent="Signing in…";
  const email=(document.getElementById("login-email") as HTMLInputElement).value.trim();
  const password=(document.getElementById("login-password") as HTMLInputElement).value;
  try{
   const response=await fetch(`${BASE}/auth/login`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
   });
   const body=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(body.error==="auth_not_configured"?"Workspace login is not configured on the server.":"Invalid email or password.");
   if(typeof body.token!=="string")throw new Error("Server did not return an access token.");
   localStorage.setItem(TOKEN_KEY,body.token);
   location.reload();
  }catch(e){
   error.textContent=e instanceof Error?e.message:"Sign in failed.";
   submit.disabled=false;
   submit.textContent="Sign in";
  }
 });
}

function addSessionControl(){
 const button=document.createElement("button");
 button.className="session-logout";
 button.type="button";
 button.textContent="Sign out";
 button.addEventListener("click",()=>{
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
 });
 document.body.appendChild(button);
}

if(localStorage.getItem(TOKEN_KEY)){
 addSessionControl();
 import("./main");
}else{
 showLogin();
}
