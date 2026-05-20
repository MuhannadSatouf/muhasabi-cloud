import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { stripeClient } from "../../../../lib/stripe";

const schema = z.object({
  planCode: z.string().trim().min(2),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.workspaceId || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({
    where: {
      code: parsed.data.planCode,
    },
  });

  if (!plan?.stripePriceId) {
    return NextResponse.json(
      { error: "This plan is not configured for card payments yet." },
      { status: 400 }
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: {
      workspaceId: session.user.workspaceId,
    },
  });

  const stripe = stripeClient();
  const origin = new URL(req.url).origin;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: subscription?.providerCustomerId || undefined,
    customer_email: subscription?.providerCustomerId ? undefined : session.user.email,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${origin}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/billing?checkout=cancelled`,
    metadata: {
      workspaceId: session.user.workspaceId,
      planId: plan.id,
      planCode: plan.code,
    },
    subscription_data: {
      metadata: {
        workspaceId: session.user.workspaceId,
        planId: plan.id,
        planCode: plan.code,
      },
    },
  });

  if (!checkout.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: checkout.url });
}
