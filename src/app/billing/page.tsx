import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { auth } from "../../auth";
import { prisma } from "../../lib/prisma";
import { CheckoutButton } from "./checkout-button";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.workspaceId) {
    redirect("/auth/login");
  }

  const [plans, subscription] = await Promise.all([
    prisma.plan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
    prisma.subscription.findUnique({
      where: {
        workspaceId: session.user.workspaceId,
      },
      include: {
        plan: true,
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a subscription plan and pay securely by card with Stripe.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current subscription</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {subscription?.plan.name ?? "No plan"} · {subscription?.status ?? "No status"}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <p className="font-mono text-2xl font-semibold">
                  {plan.monthlyPrice ? `${plan.monthlyPrice} ${plan.currency}` : "Free"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {plan.companyLimit ? `${plan.companyLimit} companies` : "Unlimited companies"}
                </p>
                <CheckoutButton
                  planCode={plan.code}
                  disabled={!plan.stripePriceId || plan.code === subscription?.plan.code}
                />
                {!plan.stripePriceId ? (
                  <p className="text-xs text-muted-foreground">
                    Stripe price not configured yet.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
