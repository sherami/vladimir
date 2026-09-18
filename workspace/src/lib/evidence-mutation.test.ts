import {describe,expect,it,vi} from "vitest";
import {submitEvidenceMutation} from "./evidence-mutation";

describe("submitEvidenceMutation",()=>{
 it("returns a persistent failure notice and never reports stale success",async()=>{
  const mutation=vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

  const result=await submitEvidenceMutation(mutation);

  expect(mutation).toHaveBeenCalledTimes(1);
  expect(result).toEqual({ok:false,notice:"Evidence could not be saved.\n\nFailed to fetch"});
  expect(result.notice).not.toContain("Evidence saved");
 });

 it("reports success only after the mutation resolves",async()=>{
  const created={id:"evidence-1"};
  const result=await submitEvidenceMutation(async()=>created);

  expect(result).toEqual({ok:true,result:created,notice:"Evidence saved with source linkage."});
 });
});
