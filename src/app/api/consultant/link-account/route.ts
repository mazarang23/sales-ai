import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentConsultant } from "@/lib/consultant-auth";
import { getCurrentUser } from "@/lib/auth";
export async function POST(req: NextRequest) {
 const consultant=await getCurrentConsultant();const user=await getCurrentUser();
 if(!consultant||!user)return NextResponse.json({error:"برای پیوند، هر دو نشست معتبر لازم است."},{status:401});
 const body=await req.json();const phone=String(body.phone||"");
 if(!/^09\d{9}$/.test(phone)||user.phone!==phone)return NextResponse.json({error:"شماره تأییدشده با حساب کاربر مطابقت ندارد."},{status:400});
 if(consultant.phone&&consultant.phone!==phone)return NextResponse.json({error:"این پروفایل قبلاً شماره دیگری دارد؛ برای تغییر شماره با پشتیبانی تماس بگیرید."},{status:409});
 const other=await db.consultant.findUnique({where:{phone},select:{id:true,userId:true}});
 if(other&&other.id!==consultant.id)return NextResponse.json({error:"این شماره قبلاً برای پروفایل مشاور دیگری ثبت شده است."},{status:409});
 const linkedConsultant=await db.consultant.findUnique({where:{userId:user.id},select:{id:true}});
 if(linkedConsultant&&linkedConsultant.id!==consultant.id)return NextResponse.json({error:"این حساب از قبل به پروفایل مشاور دیگری متصل است."},{status:409});
 const updated=await db.consultant.update({where:{id:consultant.id},data:{phone,phoneVerifiedAt:user.phoneVerifiedAt || new Date(),userId:user.id,displayName:consultant.displayName||user.name||"مشاور"}});
 return NextResponse.json({ok:true,id:updated.id});
}