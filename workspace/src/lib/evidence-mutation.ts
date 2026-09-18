import {mutationErrorMessage} from "./api";

export type EvidenceMutationResult<T> =
 | {ok:true;result:T;notice:string}
 | {ok:false;notice:string};

export async function submitEvidenceMutation<T>(mutation:()=>Promise<T>):Promise<EvidenceMutationResult<T>>{
 try{
  const result=await mutation();
  return {ok:true,result,notice:"Evidence saved with source linkage."};
 }catch(error){
  return {ok:false,notice:mutationErrorMessage("Evidence",error)};
 }
}
