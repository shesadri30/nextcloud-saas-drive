import { prisma } from "@saas/db";

async function getInstances() {
  return prisma.nextcloudInstance.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400",
  PENDING: "bg-yellow-500/20 text-yellow-400",
  PROVISIONING: "bg-blue-500/20 text-blue-400",
  SUSPENDED: "bg-red-500/20 text-red-400",
  TERMINATED: "bg-slate-500/20 text-slate-400",
};

export default async function InstancesPage() {
  const instances = await getInstances();
  const pending = instances.filter((i) => i.status === "PENDING");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Nextcloud Instances</h1>
        {pending.length > 0 && (
          <span className="bg-yellow-500/20 text-yellow-400 text-sm px-3 py-1 rounded-full">
            {pending.length} pending provisioning
          </span>
        )}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-left">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Subdomain</th>
              <th className="px-6 py-4">Storage</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">S3 Bucket</th>
              <th className="px-6 py-4">Provisioned</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {instances.map((inst) => (
              <tr
                key={inst.id}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
              >
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{inst.user.name}</div>
                  <div className="text-slate-400 text-xs">{inst.user.email}</div>
                </td>
                <td className="px-6 py-4 text-blue-400 font-mono text-xs">
                  {inst.subdomain}.yourdomain.com
                </td>
                <td className="px-6 py-4 text-slate-300">{inst.storageGB} GB</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColor[inst.status] ?? ""
                    }`}
                  >
                    {inst.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                  {inst.s3Bucket || "—"}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {inst.provisionedAt
                    ? new Date(inst.provisionedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {inst.status === "PENDING" && (
                      <form action={`/api/admin/instances/provision`} method="POST">
                        <input type="hidden" name="instanceId" value={inst.id} />
                        <button
                          type="submit"
                          className="text-yellow-400 hover:text-yellow-300 text-xs transition"
                        >
                          Provision
                        </button>
                      </form>
                    )}
                    {inst.status === "ACTIVE" && (
                      <a
                        href={`https://${inst.subdomain}.yourdomain.com`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-400 hover:text-green-300 text-xs transition"
                      >
                        Open ↗
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
