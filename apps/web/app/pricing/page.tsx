"use client";

import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: 5,
    storage: "50 GB",
    instance: "Shared",
    maxFile: "2 GB",
    customDomain: false,
    prioritySupport: false,
    sla: false,
    highlight: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
  },
  {
    name: "Personal",
    price: 12,
    storage: "200 GB",
    instance: "Dedicated",
    maxFile: "5 GB",
    customDomain: false,
    prioritySupport: false,
    sla: false,
    highlight: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL,
  },
  {
    name: "Pro",
    price: 29,
    storage: "1 TB",
    instance: "Dedicated",
    maxFile: "20 GB",
    customDomain: true,
    prioritySupport: false,
    sla: false,
    highlight: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    name: "Business",
    price: 99,
    storage: "5 TB",
    instance: "Dedicated",
    maxFile: "50 GB",
    customDomain: true,
    prioritySupport: true,
    sla: true,
    highlight: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Choose the plan that fits your needs. All plans include your own
            Nextcloud drive with S3 storage.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 border flex flex-col ${
                plan.highlight
                  ? "bg-blue-600 border-blue-400 shadow-2xl shadow-blue-500/30 scale-105"
                  : "bg-slate-800/60 border-slate-700"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
              <div className="text-4xl font-extrabold my-3">
                ${plan.price}
                <span className="text-sm font-normal text-slate-300">/mo</span>
              </div>
              <div className="text-sm text-slate-300 mb-6 space-y-1">
                <p>💾 {plan.storage} Storage</p>
                <p>🖥 {plan.instance} Instance</p>
                <p>📁 Max file: {plan.maxFile}</p>
                <p>{plan.customDomain ? "✅" : "❌"} Custom Domain</p>
                <p>{plan.prioritySupport ? "✅" : "❌"} Priority Support</p>
                <p>{plan.sla ? "✅" : "❌"} 99.9% SLA</p>
              </div>
              <Link
                href={`/auth/register?plan=${plan.name.toLowerCase()}`}
                className={`mt-auto text-center py-3 rounded-xl font-semibold transition ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-slate-100"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-12 text-center bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
          <p className="text-slate-400 mb-4">
            Need more than 5 TB? Custom SLA, dedicated support, multi-region,
            and white-label options available.
          </p>
          <a
            href="mailto:hello@yourdomain.com"
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </main>
  );
}
