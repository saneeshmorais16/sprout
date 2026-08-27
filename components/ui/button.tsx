import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) { return <button className={cn("ui-button", `ui-button-${variant}`, className)} {...props}/>; }
