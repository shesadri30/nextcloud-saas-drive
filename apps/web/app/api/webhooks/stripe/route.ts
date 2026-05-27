import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@saas/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[STRIPE WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const planRecord = await prisma.plan.findFirst({
          where: { name: { equals: plan, mode: "insensitive" } },
        });

        if (!planRecord) break;

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId: planRecord.id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            status: "ACTIVE",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          update: {
            planId: planRecord.id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            status: "ACTIVE",
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        // Create a pending Nextcloud instance record
        await prisma.nextcloudInstance.create({
          data: {
            userId,
            subdomain: `user-${userId.slice(0, 8)}`,
            status: "PENDING",
            storageGB: planRecord.storageGB,
            s3Bucket: "",
            s3Endpoint: "",
            s3AccessKey: "",
            s3SecretKey: "",
          },
        });

        console.log(`[WEBHOOK] Subscription created for user ${userId}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "ACTIVE" },
        });

        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subId },
        });

        if (sub) {
          await prisma.invoice.create({
            data: {
              userId: sub.userId,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: "paid",
              paidAt: new Date(),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED" },
        });

        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });

        if (subscription) {
          await prisma.nextcloudInstance.updateMany({
            where: { userId: subscription.userId },
            data: { status: "SUSPENDED" },
          });
        }
        break;
      }

      default:
        console.log(`[STRIPE WEBHOOK] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[STRIPE WEBHOOK ERROR]", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
