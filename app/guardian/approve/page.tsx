import { redirect } from "next/navigation";

/** Legacy approval links no longer gate access to GROW. */
export default function ApprovalPage() {
  redirect("/");
}
