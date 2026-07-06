import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import ToolsBand from "./components/ToolsBand";
import CtaBanner from "./components/CtaBanner";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Cloud Heroes Africa — Student Portal",
  description:
    "A structured, mentor-led cloud training programme for students across Africa.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cha-surface text-cha-ink">
      <Navbar />
      <Hero />
      <Features />
      <ToolsBand />
      <CtaBanner />
      <Footer />
    </div>
  );
}
