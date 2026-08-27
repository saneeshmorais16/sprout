import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type StoredMedia = { key: string; url: string; bytes: number; mimeType: string };
export interface MediaStorage { save(data: Uint8Array, extension: string, mimeType: string): Promise<StoredMedia>; read(key: string): Promise<{ data: Buffer; size: number }>; }

const mediaRoot = path.join(process.cwd(), "storage", "media");
function safeKey(key: string) { if (!/^[a-f0-9-]+\.(mp4|webm|png|jpe?g|webp)$/i.test(key)) throw new Error("Invalid media key."); return key; }

class LocalMediaStorage implements MediaStorage {
  async save(data: Uint8Array, extension: string, mimeType: string) { await mkdir(mediaRoot, { recursive: true }); const key=`${randomUUID()}.${extension.toLowerCase().replace(/^\./,"")}`; await writeFile(path.join(mediaRoot,key),data); return {key,url:`/api/media/${key}`,bytes:data.byteLength,mimeType}; }
  async read(key: string) { const file=path.join(mediaRoot,safeKey(key)); const [data,details]=await Promise.all([readFile(file),stat(file)]); return {data,size:details.size}; }
}

export const mediaStorage: MediaStorage = new LocalMediaStorage();

export function detectMedia(data: Uint8Array, claimedType: string, fileName: string, kind: "video"|"image") {
  const extension=fileName.split(".").pop()?.toLowerCase() || "";
  const ascii=String.fromCharCode(...data.slice(4,12));
  const hex=Array.from(data.slice(0,12)).map(value=>value.toString(16).padStart(2,"0")).join("");
  const choices = kind === "video" ? [
    {extension:"mp4",mime:"video/mp4",valid:ascii.includes("ftyp")},
    {extension:"webm",mime:"video/webm",valid:hex.startsWith("1a45dfa3")},
  ] : [
    {extension:"png",mime:"image/png",valid:hex.startsWith("89504e470d0a1a0a")},
    {extension:"jpg",mime:"image/jpeg",valid:hex.startsWith("ffd8ff")},
    {extension:"jpeg",mime:"image/jpeg",valid:hex.startsWith("ffd8ff")},
    {extension:"webp",mime:"image/webp",valid:hex.startsWith("52494646")&&ascii.includes("WEBP")},
  ];
  const match=choices.find(item=>item.extension===extension&&item.mime===claimedType&&item.valid);
  return match ? {extension:match.extension==="jpeg"?"jpg":match.extension,mimeType:match.mime} : null;
}
