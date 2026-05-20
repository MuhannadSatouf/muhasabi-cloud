"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../../../components/ui/button";
import { inputFieldClass } from "../../../../components/ui/field-classes";

export function KycAdminForm({
  workspaceId,
  status,
  expiresAt,
}: {
  workspaceId: string;
  status: string;
  expiresAt: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/kyc/${workspaceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: String(fd.get("status") ?? ""),
        expiresAt: String(fd.get("expiresAt") ?? ""),
        note: String(fd.get("note") ?? ""),
      }),
    });

    const data = await res.json().catch(() => null);
    setPending(false);

    if (!res.ok) {
      setMessage(data?.error ?? "Could not update KYC.");
      return;
    }

    setMessage("KYC updated.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-foreground">Status</span>
        <select name="status" defaultValue={status} className={inputFieldClass}>
          <option value="NOT_STARTED">Not started</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Needs correction</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </label>
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-foreground">KYC valid until</span>
        <input
          name="expiresAt"
          type="date"
          defaultValue={expiresAt}
          className={inputFieldClass}
        />
      </label>
      <label className="space-y-1.5 md:col-span-3">
        <span className="text-sm font-medium text-foreground">Internal note</span>
        <input
          name="note"
          placeholder="Reason for review/update"
          className={inputFieldClass}
        />
      </label>
      {message ? <p className="text-sm text-muted-foreground md:col-span-2">{message}</p> : null}
      <div className="md:col-start-3">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Updating..." : "Update KYC"}
        </Button>
      </div>
    </form>
  );
}
