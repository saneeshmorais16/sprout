import Link from "next/link";
import { Sprout } from "lucide-react";
export function Brand() { return <Link className="grow-brand" href="/"><span>GROW</span><Sprout aria-hidden="true"/></Link>; }
