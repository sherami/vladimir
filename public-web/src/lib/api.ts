const BASE=import.meta.env.VITE_PUBLIC_API_URL??"http://localhost:3000/api/v1";
export async function getPublishedProperty(id:string){
 const r=await fetch(`${BASE}/properties/${id}/public`);
 if(!r.ok) throw new Error(r.status===404?"Property is not published":await r.text());
 return r.json();
}
