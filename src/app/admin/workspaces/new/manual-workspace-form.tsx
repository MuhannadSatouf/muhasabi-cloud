"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { inputFieldClass } from "../../../../components/ui/field-classes";

export function ManualWorkspaceForm({ plans }: { plans: { code: string; name: string }[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/workspaces", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceName: String(fd.get("workspaceName") ?? ""),
        ownerName: String(fd.get("ownerName") ?? ""),
        ownerEmail: String(fd.get("ownerEmail") ?? ""),
        temporaryPassword: String(fd.get("temporaryPassword") ?? ""),
        planCode: String(fd.get("planCode") ?? "TRIAL"),
      }),
    });

    const data = await res.json().catch(() => null);
    setPending(false);

    if (!res.ok) {
      setMessage(data?.error ?? "Could not create workspace.");
      return;
    }

    router.push(`/admin/workspaces/${data.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register customer workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Workspace name</span>
            <input name="workspaceName" required minLength={2} className={inputFieldClass} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Plan</span>
            <select name="planCode" className={inputFieldClass} defaultValue="TRIAL">
              {plans.map((plan) => (
                <option key={plan.code} value={plan.code}>
                  {plan.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Owner name</span>
            <input name="ownerName" required minLength={2} className={inputFieldClass} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Owner email</span>
            <input name="ownerEmail" type="email" required className={inputFieldClass} />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-foreground">Temporary password</span>
            <input
              name="temporaryPassword"
              type="password"
              required
              minLength={8}
              className={inputFieldClass}
            />
          </label>
          {message ? <p className="text-sm text-destructive md:col-span-2">{message}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create workspace"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
