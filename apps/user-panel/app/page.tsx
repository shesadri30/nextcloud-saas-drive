import { auth } from "@/lib/auth";
import { prisma } from "@saas/db";
import { redirect } from "next/navigation";

async function getUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: { include: { plan: true } }, instance: true },
  });
}

export default async function UserDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await getUserData(session.user.id);
  if (!user) redirect("/auth/login");

  const sub = user.subscription;
  const inst = user.instance;
  const plan = sub?.plan;
  const storageUsedPercent = 65; // TODO: fetch live from Nextcloud API

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name} 👋</h1>
        <p className="text-slate-400 mb-10">{user.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-1">Current Plan</div>
            <div className="text-2xl font-bold text-blue-400">{plan?.name ?? "No Plan"}</div>
            <div className="text-slate-300 text-sm mt-1">{plan?.storageGB} GB Storage</div>
            <div className="mt-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub?.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {sub?.status ?? "INACTIVE"}
              </span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-1">Storage Usage</div>
            <div className="text-2xl font-bold text-white">
              {Math.round(((plan?.storageGB ?? 0) * storageUsedPercent) / 100)} GB
              <span className="text-slate-400 text-sm font-normal"> / {plan?.storageGB} GB</span>
            </div>
            <div className="mt-3 bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${storageUsedPercent}%` }} />
            </div>
            <div className="text-slate-400 text-xs mt-1">{storageUsedPercent}% used</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-sm mb-1">Your Drive</div>
            {inst?.status === "ACTIVE" ? (
              <>
                <div className="text-green-400 font-semibold mb-3">● Online</div>
                <a href={`https://${inst.subdomain}.yourdomain.com`} target="_blank" rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition inline-block">
                  Open My Drive ↗
                </a>
              </>
            ) : (
              <div className="text-yellow-400 text-sm">
                {inst?.status === "PENDING" ? "⏳ Provisioning in progress — email soon." : "No instance found."}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Billing & Subscription</h2>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <div><span className="text-slate-500">Renewal: </span>{sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}</div>
            <div><span className="text-slate-500">Plan: </span>${plan?.priceMonthly}/month</div>
          </div>
          <div className="flex gap-3 mt-5">
            <a href="/api/user/portal" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition">Manage Billing</a>
            <a href="/pricing" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition">Upgrade Plan</a>
          </div>
        </div>
      </div>
    </main>
  );
}
