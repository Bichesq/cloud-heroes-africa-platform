import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/invite");

  const { given_name, family_name, email } = session.user;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          givenName={given_name}
          familyName={family_name}
          email={email}
        />
        <main className="flex-1 px-6 py-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}