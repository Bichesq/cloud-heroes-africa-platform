import InviteForm from "./InviteForm/page";

export default function InvitePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Welcome to Cloud Heroes Africa</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Enter your invite code to begin registration.
        </p>
        <InviteForm />
      </div>
    </main>
  );
}