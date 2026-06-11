export default function SupportPage() {
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Help Desk</h1>
      <p className="text-sm text-gray-500 mb-8">
        Need assistance? Use the options below.
      </p>

      <div className="card flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium mb-1">Raise a support ticket</p>
          <p className="text-xs text-gray-400 mb-2">
            {/* TODO: replace with real Service Desk URL */}
            Phase 1 uses email-based support. Link to be confirmed.
          </p>
          <a
            href="mailto:support@cloudheroesafrica.com"
            className="text-sm text-blue-600 hover:underline"
          >
            {/* TODO: confirm support email address */}
            support@cloudheroesafrica.com
          </a>
        </div>

        <div className="border-t border-gray-100 pt-4" id="account">
          <p className="text-sm font-medium mb-1">Can&apos;t access your account?</p>
          <p className="text-xs text-gray-400">
            {/* TODO: wire to real MFA reset / account recovery flow */}
            For MFA resets or login issues, contact your programme coordinator directly.
          </p>
        </div>
      </div>
    </div>
  );
}