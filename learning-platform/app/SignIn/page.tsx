import type { Metadata } from "next";
import SignInClient from "./components/SignInClient";

export const metadata: Metadata = {
  title: "Sign In — Cloud Heroes Africa",
  description: "Sign in to the Cloud Heroes Africa Learning Platform",
};

export default function SignInPage() {
  return <SignInClient />;
}
