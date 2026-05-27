import { prisma } from "@saas/db";

async function getUsers() {
  return prisma.user.findMany({
    include: {
      subscription: { include: { plan: true } },
      instance: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400",
  CANCELED: "bg-red-500/20 text-red-400",
  PAST_DUE: "bg-yellow-500/20 text-yellow-400",
  TRIALING: "bg-blue-500/20 text-blue-400",
  PAUSED: "bg-slate-500/20 text-slate-400",
};

const instanceColor: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400",
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PROVISIONING: "bg-blue-500/20 text-blue-400",
  SUSPENDED: "bg-red-500/20 text-red-400",
  TERMINATED: "bg-slate-500/20 text-slate-400",
};

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <span className="text-slate-400 text-sm">{users.length} total</span>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Subscription</th>
              <th className="px-6 py-4">Instance</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-slate-400">{user.email}</div>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {user.subscription?.plan?.name ?? "—"}
                </td>
                <td className="px-6 py-4">
                  {user.subscription ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColor[user.subscription.status] ?? ""
                      }`}
                    >
                      {user.subscription.status}
                    </span>
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.instance ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        instanceColor[user.instance.status] ?? ""
                      }`}
                    >
                      {user.instance.status}
                    </span>
                  ) : (
                    <span className="text-slate-500">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <a
                      href={`/users/${user.id}`}
                      className="text-blue-400 hover:text-blue-300 text-xs transition"
                    >
                      View
                    </a>
                    {user.instance?.status === "PENDING" && (
                      <a
                        href={`/instances/provision?userId=${user.id}`}
                        className="text-yellow-400 hover:text-yellow-300 text-xs transition"
                      >
                        Provision
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
