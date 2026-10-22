import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
export const runtime = "nodejs";
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
 let body:any;try{body=await req.json();}catch{return NextResponse.json({error:"JSON نامعتبر"},{status:400});}
 const title=typeof body.title==="string"?body.title.trim():"";
 const slug=typeof body.slug==="string"?body.slug.trim().toLowerCase():"";
 const excerpt=typeof body.excerpt==="string"?body.excerpt.trim():"";
 const content=typeof body.body==="string"?body.body.trim():"";
 if(title.length<12||title.length>160||excerpt.length<40||excerpt.length>500||content.length<800||content.length>18000||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return NextResponse.json({error:"محتوا ناقص یا نامعتبر است."},{status:400});
 const existing=await db.blogPost.findUnique({where:{slug},select:{id:true}});
 if(existing)return NextResponse.json({error:"این slug قبلاً استفاده شده است؛ مقاله جدید منتشر نشد."},{status:409});
 const post=await db.blogPost.create({data:{title,slug,excerpt,body:content,published:true}});
 return NextResponse.json({ok:true,id:post.id,slug:post.slug,published:post.published},{status:201});
}