import {rootApp} from "./api/root.js";
const port=Number(process.env.PORT??3000);
rootApp.listen(port,()=>console.log(`PrivatePhuket API listening on :${port}`));
