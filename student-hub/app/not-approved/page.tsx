import Link from "next/link";

export default function NotApprovedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="text-4xl mb-4">📋</div>
        <h1 className="text-2xl font-semibold mb-2">
          You&apos;re not on the list yet
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Your email isn&apos;t on the approved list for Cloud Heroes Africa.
          Complete the registration form and a coordinator will review your
          application.
        </p>
        <a
          href={process.env.NEXT_PUBLIC_REGISTRATION_FORM_URL ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white
                     font-medium px-8 py-3 rounded-lg text-sm transition-colors"
        >
          Apply to join →
        </a>
        <p className="text-xs text-gray-400 mt-6">
          Already applied? Contact your programme coordinator to check your
          status.
        </p>
        <Link
          href="/"
          className="block mt-4 text-xs text-blue-600 hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}