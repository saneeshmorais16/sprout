import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaStorage } from "@/lib/storage";

type RouteContext={params:Promise<{key:string}>};
export async function GET(_:Request,{params}:RouteContext){
  const {key}=await params; const url=`/api/media/${key}`;
  const media=await db.video.findFirst({where:{OR:[{sourceUrl:url},{thumbnailUrl:url}]}}); if(!media)return new NextResponse("Not found",{status:404});
  if(!media.published){const user=await currentUser();if(!user||!["ADMIN","CONTENT_EDITOR"].includes(user.role))return new NextResponse("Not found",{status:404});}
  try{const file=await mediaStorage.read(key);const isThumb=media.thumbnailUrl===url;return new NextResponse(new Uint8Array(file.data),{headers:{"Content-Type":isThumb?guessImage(key):(media.mimeType||"application/octet-stream"),"Content-Length":String(file.size),"Cache-Control":"private, max-age=3600","X-Content-Type-Options":"nosniff"}});}catch{return new NextResponse("Not found",{status:404});}
}
function guessImage(key:string){if(key.endsWith(".png"))return"image/png";if(key.endsWith(".webp"))return"image/webp";return"image/jpeg";}
