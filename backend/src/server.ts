import { app } from "./api/app.js";
const port=Number(process.env.PORT??3000);
app.listen(port,()=>console.log(`PrivatePhuket API listening on :${port}`));
