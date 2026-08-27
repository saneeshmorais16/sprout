import {randomUUID} from "node:crypto";

const blocked=/password|token|secret|authorization|cookie|api.?key/i;
function sanitize(value:unknown):unknown{if(Array.isArray(value))return value.map(sanitize);if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,blocked.test(key)?"[REDACTED]":sanitize(item)]));return value}
export function requestId(request?:Request){const supplied=request?.headers.get("x-request-id")?.trim();return supplied&&/^[a-zA-Z0-9_-]{8,80}$/.test(supplied)?supplied:randomUUID()}
export function logServerEvent(event:string,details:Record<string,unknown>={}){const clean=sanitize(details) as Record<string,unknown>;console.info(JSON.stringify({timestamp:new Date().toISOString(),level:"info",event,...clean}))}
