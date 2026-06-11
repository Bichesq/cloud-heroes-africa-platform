export default function HelpDeskEntry() {
  return (
    <div className="card flex flex-col gap-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide">Need help?</p>

      
        href="/support"
        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
      <a>
        {/* TODO: replace /support with real Service Desk URL or form */}
        🎫 Raise a support ticket
      </a>

      
        href="/support#account"
        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
      <a>
        {/* TODO: replace with real account recovery flow */}
        🔑 Can&apos;t access my account
      </a>

      <div className="border-t border-gray-100 pt-3">
  <a
    href="#knowledge-base"
    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
  >
    📚 Browse Knowledge Base
  </a>
</div>
    </div>
  );
}