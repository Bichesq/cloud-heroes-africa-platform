"use client";

import { Button } from "@heroui/react";
import { cardClass } from "./fields";

/** Multi-Factor Authentication card. */
export default function MfaCard({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`flex flex-col gap-5 p-7 ${cardClass}`}>
      <h2 className="whitespace-nowrap font-display text-[22px] font-bold text-cha-orange">
        Multi-Factor Authentication (MFA)
      </h2>
      <div className="flex items-center justify-between gap-6">
        <p className="text-[13.5px] leading-relaxed text-cha-muted">
          {enabled ? (
            <>
              Email OTP Protection is enabled for this user.
              <br />
              An email with the security code is sent on each login.
            </>
          ) : (
            <>
              Email OTP Protection is disabled for this user.
              <br />
              Email with the security code on each login will not be sent
            </>
          )}
        </p>
        <Button
          variant="primary"
          onPress={onToggle}
          className="shrink-0 rounded-full bg-cha-blue px-6 font-semibold text-white hover:bg-cha-blue/90"
        >
          {enabled ? "Disable MFA" : "Enable MFA"}
        </Button>
      </div>
    </div>
  );
}
