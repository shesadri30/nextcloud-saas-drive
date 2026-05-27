import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@saas/db";
import { hash } from "bcryptjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const PLAN_PRICE_MAP: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  personal: process.env.STRIPE_PRICE_PERSONAL!,
  pro: process.env.STRIPE_PRICE_PRO!,
  business: process.env.STRIPE_PRICE_BUSINESS!,
};

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, plan } = await req.json();

    if (!name || !email || !password || !plan) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const priceId = PLAN_PRICE_MAP[plan.toLowerCase()];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { userId: user.id },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.APP_URL}/pricing?canceled=true`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
