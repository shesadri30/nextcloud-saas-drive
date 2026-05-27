import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-400">☁ CloudDrive</div>
        <div className="flex gap-6 text-sm text-slate-300">
          <Link href="#features" className="hover:text-white transition">Features</Link>
          <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="/auth/login" className="hover:text-white transition">Login</Link>
          <Link
            href="/pricing"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-32 px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Your Own Private{" "}
          <span className="text-blue-400">Cloud Drive</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Get a dedicated Nextcloud instance with S3-powered storage. Secure,
          private, and fully under your control. No big tech spying on your
          files.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/pricing"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition"
          >
            View Plans
          </Link>
          <Link
            href="#features"
            className="border border-slate-600 hover:border-slate-400 text-slate-300 px-8 py-4 rounded-xl text-lg transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Why CloudDrive?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-24 px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to take control of your data?</h2>
        <p className="text-slate-400 mb-8">Start with as little as $5/month. Cancel anytime.</p>
        <Link
          href="/pricing"
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl text-lg font-semibold transition"
        >
          Choose a Plan
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} SHESADRI SOFTECH PRIVATE LIMITED. All rights reserved.
      </footer>
    </main>
  );
}

const features = [
  {
    icon: "🔒",
    title: "Private & Isolated",
    description:
      "Each user gets a dedicated Nextcloud instance. Your data is never shared with others.",
  },
  {
    icon: "☁️",
    title: "S3-Powered Storage",
    description:
      "Backed by Cloudflare R2, Backblaze B2, or your own S3-compatible storage. Infinitely scalable.",
  },
  {
    icon: "💳",
    title: "Simple Billing",
    description:
      "Transparent pricing with Stripe. Upgrade, downgrade, or cancel your plan at any time.",
  },
  {
    icon: "🚀",
    title: "Instant Setup",
    description:
      "Your cloud drive is provisioned automatically after purchase. Ready in minutes.",
  },
  {
    icon: "🌐",
    title: "Your Own Subdomain",
    description:
      "Access your drive at yourname.clouddrive.com with automatic HTTPS via Let's Encrypt.",
  },
  {
    icon: "🛡️",
    title: "Enterprise Security",
    description:
      "End-to-end encryption, 2FA support, and audit logs keep your files safe.",
  },
];
