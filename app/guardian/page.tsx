import { redirect } from "next/navigation";

/** Parent/guardian approval is retired from the 15–18 MVP. */
export default function GuardianPage() {
  redirect("/dashboard");
}
