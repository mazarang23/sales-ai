import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import OpenAI from "openai";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export const maxDuration = 90;

export async function GET() {
 const posts=await db.blogPost.findMany({where:{published:true},orderBy:{createdAt:"desc"},take:20,select:{title:true,excerpt:true,slug:true}});
 return NextResponse.json({posts});
}

export async function POST(req: NextRequest) {
 const expected=process.env.CONTENT_PUBLISH_TOKEN;
 if(!expected)return NextResponse.json({error:"CONTENT_PUBLISH_TOKEN تنظیم نشده است."},{status:503});
 const supplied=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 const a=Buffer.from(expected);const b=Buffer.from(supplied);
 if(a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:"FORBIDDEN"},{status:403});
 if(!process.env.OPENROUTER_API_KEY)return NextResponse.json({error:"OPENROUTER_API_KEY در محیط سایت تنظیم نشده است."},{status:503});
 const recent=await db.blogPost.findMany({where:{published:true},orderBy:{createdAt:"desc"},take:20,select:{title:true,slug:true}});
 const today=new Date().toISOString().slice(0,10);
 const prompt=`برای وبلاگ فارسی فروش‌یار یک مقاله آموزشی کاربردی و آماده انتشار بنویس. تاریخ شناسه: ${today}. عناوین مقالات منتشرشده اخیر که باید از تکرارشان پرهیز کنی: ${recent.map(p=>p.title).join("؛ ")}. موضوع را از بین تحلیل فروشگاه، سنجش سود در برابر فروش، نگهداشت مشتری، RFM، Cohort، سبد خرید، موجودی، تخفیف و بازاریابی انتخاب کن. هیچ آمار یا پژوهش ساختگی نساز؛ مثال عددی را صریحاً فرضی معرفی کن. متن باید فارسی روان، عملی، بدون شعار و حدود 900 تا 1300 کلمه باشد؛ شامل مقدمه، 4 تا 6 تیتر، یک مثال فرضی، چک‌لیست اقدام و جمع‌بندی. متن body را با Markdown بنویس. فقط JSON معتبر با کلیدهای title، excerpt، slug، body برگردان؛ slug انگلیسی کوتاه و شامل تاریخ ${today} باشد. excerpt بین 2 تا 3 جمله باشد.`;
 try {
  const client=new OpenAI({apiKey:process.env.OPENROUTER_API_KEY,baseURL:"https://openrouter.ai/api/v1"});
  const completion=await client.chat.completions.create({
   model:"google/gemini-3.1-flash-lite",
   temperature:0.7,
   response_format:{type:"json_object"},
   messages:[
    {role:"system",content:"You are a careful Persian editorial writer for an ecommerce sales analytics product. Return valid JSON only, no markdown code fence. Avoid fabricated statistics, sources, or promises."},
    {role:"user",content:prompt}
   ]
  });
  const raw=completion.choices[0]?.message?.content;
  if(!raw)return NextResponse.json({error:"مدل محتوایی تولید نکرد."},{status:502});
  const article=JSON.parse(raw) as {title?:string;slug?:string;excerpt?:string;body?:string};
  const title=typeof article.title==="string"?article.title.trim():"";
  const slug=typeof article.slug==="string"?article.slug.trim().toLowerCase():"";
  const excerpt=typeof article.excerpt==="string"?article.excerpt.trim():"";
  const body=typeof article.body==="string"?article.body.trim():"";
  if(title.length<12||title.length>160||excerpt.length<40||excerpt.length>500||body.length<800||body.length>18000||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return NextResponse.json({error:"محتوای تولیدشده از کنترل کیفیت اولیه عبور نکرد."},{status:502});
  const finalSlug=slug.includes(today)?slug:`${slug}-${today}`;
  const exists=await db.blogPost.findUnique({where:{slug:finalSlug},select:{id:true}});
  if(exists)return NextResponse.json({error:"برای امروز مقاله‌ای با این شناسه قبلاً منتشر شده است."},{status:409});
  const post=await db.blogPost.create({data:{title,slug:finalSlug,excerpt,body,published:true}});
  return NextResponse.json({ok:true,id:post.id,title:post.title,slug:post.slug,published:true},{status:201});
 } catch(error) {
  console.error("daily blog publishing failed:",error instanceof Error?error.message:error);
  return NextResponse.json({error:"تولید یا انتشار مقاله انجام نشد."},{status:502});
 }
}