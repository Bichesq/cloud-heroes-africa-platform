import { redirect } from "next/navigation";

/** The LP has no public landing — the app's home is the student's courses. */
export default function Home() {
  redirect("/courses");
}
