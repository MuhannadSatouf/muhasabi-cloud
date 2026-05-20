"use client";

import { useState } from "react";

import { Button } from "../../components/ui/button";

export function CheckoutButton({
  planCode,
  disabled,
}: {
  planCode: string;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function checkout() {
    setMessage("");
    setPending(true);

    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planCode }),
    });

    const data = await res.json().catch(() => null);
    setPending(false);

    if (!res.ok || !data?.url) {
      setMessage(data?.error ?? "Could not start checkout.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={checkout} disabled={disabled || pending}>
        {pending ? "Opening..." : "Pay with card"}
      </Button>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}
