import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "../../../../lib/prisma";
import { stripeClient } from "../../../../lib/stripe";

export async function POST(req: Request) {
  const stripe = stripeClient();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;
    const workspaceId = checkout.metadata?.workspaceId;
    const planId = checkout.metadata?.planId;

    if (workspaceId && planId) {
      await prisma.subscription.upsert({
        where: {
          workspaceId,
        },
        update: {
          planId,
          status: "ACTIVE",
          provider: "stripe",
          providerCustomerId:
            typeof checkout.customer === "string" ? checkout.customer : null,
          providerSubscriptionId:
            typeof checkout.subscription === "string" ? checkout.subscription : null,
          currentPeriodStartsAt: new Date(),
        },
        create: {
          workspaceId,
          planId,
          status: "ACTIVE",
          provider: "stripe",
          providerCustomerId:
            typeof checkout.customer === "string" ? checkout.customer : null,
          providerSubscriptionId:
            typeof checkout.subscription === "string" ? checkout.subscription : null,
          currentPeriodStartsAt: new Date(),
        },
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const rawSubscription = (invoice as unknown as {
      subscription?: string | { id: string } | null;
    }).subscription;
    const subscriptionId =
      typeof rawSubscription === "string"
        ? rawSubscription
        : rawSubscription?.id ?? null;

    if (subscriptionId) {
      await prisma.subscription.updateMany({
        where: {
          providerSubscriptionId: subscriptionId,
        },
        data: {
          status: "PAST_DUE",
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
