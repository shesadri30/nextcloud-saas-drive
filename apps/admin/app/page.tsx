import { prisma } from "@saas/db";

async function getStats() {
  const [totalUsers, activeSubscriptions, pendingInstances, activeInstances] =
    await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.nextcloudInstance.count({ where: { status: "PENDING" } }),
      prisma.nextcloudInstance.count({ where: { status: "ACTIVE" } }),
    ]);
  return { totalUsers, activeSubscriptions, pendingInstances, activeInstances };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "blue" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: "💳", color: "green" },
    { label: "Active Instances", value: stats.activeInstances, icon: "🖥", color: "purple" },
    { label: "Pending Provisioning", value: stats.pendingInstances, icon: "⏳", color: "yellow" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <div className="text-slate-400 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/users"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Manage Users
          </a>
          <a
            href="/instances"
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Manage Instances
          </a>
          <a
            href="/instances?filter=pending"
            className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Provision Pending ({stats.pendingInstances})
          </a>
        </div>
      </div>
    </div>
  );
}
