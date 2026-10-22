"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function BlogPublishToggle({ id, published }: { id: string; published: boolean }) {
 const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const router=useRouter();
 async function toggle(){setBusy(true);setError("");try{const r=await fetch("/api/admin/blog",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,published:!published})});const data=await r.json();if(!r.ok)throw new Error(data.error||"تغییر وضعیت انجام نشد");router.refresh();}catch(e){setError(e instanceof Error?e.message:"خطا");}finally{setBusy(false);}}
 return <div className="flex flex-col items-start gap-1"><button onClick={toggle} disabled={busy} className={published?"rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100":"rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"}>{busy?"در حال ذخیره…":published?"عدم نمایش":"انتشار"}</button>{error&&<span className="text-xs text-red-600">{error}</span>}</div>;
}