export function scenarioDraftKey(source:string,initial:Record<string,string>){
 return `privatephuket:scenario:v1:${JSON.stringify([source,initial])}`;
}
export function restoreScenarioDraft<T extends Record<string,string>>(key:string,initial:T):T|null{
 try{
  const raw=sessionStorage.getItem(key);
  if(!raw||raw.length>4000)return null;
  const stored=JSON.parse(raw);
  if(!stored||Array.isArray(stored)||typeof stored!=="object")return null;
  const result={...initial};
  for(const field of Object.keys(initial)){
   const value=stored[field];
   if(typeof value!=="string"||value.length>80||!/^[-+0-9.eE]*$/.test(value))return null;
   result[field as keyof T]=value as T[keyof T];
  }
  return result;
 }catch{return null}
}
export function saveScenarioDraft(key:string,draft:Record<string,string>){
 try{sessionStorage.setItem(key,JSON.stringify(draft));return true}catch{return false}
}
