"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../../../components/ui/button";
import { inputFieldClass } from "../../../../components/ui/field-classes";

export function WorkspaceAdminActions({
  workspaceId,
  isBlocked,
}: {
  workspaceId: string;
  isBlocked: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function blockToggle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/workspaces/${workspaceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: isBlocked ? "unblock" : "block",
        reason: String(fd.get("reason") ?? ""),
      }),
    });

    setPending(false);

    if (!res.ok) {
      setMessage("Could not update workspace.");
      return;
    }

    router.refresh();
  }

  async function removeWorkspace() {
    const confirmed = window.confirm(
      "Delete this workspace and all related customer data? This cannot be undone."
    );

    if (!confirmed) return;

    setPending(true);
    const res = await fetch(`/api/admin/workspaces/${workspaceId}`, {
      method: "DELETE",
    });
    setPending(false);

    if (!res.ok) {
      setMessage("Could not delete workspace.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={blockToggle} className="space-y-3">
        {!isBlocked ? (
          <input
            name="reason"
            placeholder="Block reason"
            className={inputFieldClass}
          />
        ) : null}
        <Button type="submit" variant={isBlocked ? "brand" : "outline"} disabled={pending}>
          {isBlocked ? "Unblock workspace" : "Block workspace"}
        </Button>
      </form>
      <Button type="button" variant="destructive" onClick={removeWorkspace} disabled={pending}>
        Delete workspace
      </Button>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </div>
  );
}
