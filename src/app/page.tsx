import { redirect } from "next/navigation";

export default function RootPage() {
  // Root route forwards to the home dashboard. Public marketing site can
  // replace this later.
  redirect("/home");
}
