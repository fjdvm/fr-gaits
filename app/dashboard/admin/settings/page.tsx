import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { ApiKeyManagementCard } from "@/components/features/admin-settings/api-key-management-card";
import { HeartPulse, Terminal, CloudLightning } from "lucide-react";

const API_KEY_SETTINGS = [
  { key: "GROQ_API_KEY", label: "Groq API Key" },
  { key: "GOOGLE_GENERATIVE_AI_API_KEY", label: "Google AI API Key" },
];

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "admin") redirect("/login");

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: API_KEY_SETTINGS.map((k) => k.key) } },
  });

  const settingsMap = new Map(settings.map((s) => [s.key, s]));

  const apiKeys = API_KEY_SETTINGS.map((item) => {
    const setting = settingsMap.get(item.key);
    return {
      key: item.key,
      label: item.label,
      hasValue: !!setting?.value,
      updatedAt: setting?.updatedAt?.toISOString() ?? null,
    };
  });

  return (
    <>
      <DashboardHeader title="Admin Settings" description="Manage system configuration and API integrations." />
      <main className="flex-grow overflow-y-auto px-6 md:px-10 pb-10 pt-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column: API Keys */}
          <ApiKeyManagementCard initialKeys={apiKeys} />

          {/* Right Column: Health and Connections */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white p-6 rounded-[24px] border border-surface-container shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface">
                    <HeartPulse className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface">System Health</h3>
                    <p className="text-xs text-secondary">Real-time performance metrics.</p>
                  </div>
                </div>
                <span className="bg-[#e6f4ea] text-[#137333] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Operational
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
                  <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">API Latency</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-on-surface">124</span>
                    <span className="text-xs text-secondary mb-1">ms</span>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
                  <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Error Rate (1h)</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-on-surface">0.02</span>
                    <span className="text-xs text-secondary mb-1">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Env Variables Card */}
            <div className="bg-white p-6 rounded-[24px] border border-surface-container shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface">
                  <Terminal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Security Variables</h3>
                  <p className="text-xs text-secondary">Server-side keys (read-only).</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-surface-container">
                <div>
                  <p className="font-bold text-xs text-on-surface">ENCRYPTION_KEY</p>
                  <p className="text-[10px] text-secondary mt-0.5">Used to encrypt database keys</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${process.env.ENCRYPTION_KEY ? "bg-primary-container text-on-primary-container" : "bg-destructive/10 text-destructive"}`}>
                  {process.env.ENCRYPTION_KEY ? "Configured" : "Not Set"}
                </span>
              </div>
            </div>

            {/* Judge0 Config Card */}
            <div className="bg-white p-6 rounded-[24px] border border-surface-container shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface">
                  <CloudLightning className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Judge0 Execution</h3>
                  <p className="text-xs text-secondary">Code compiler configuration.</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-surface-container">
                <div>
                  <p className="font-bold text-xs text-on-surface">Judge0 Cloud (ce.judge0.com)</p>
                  <p className="text-[10px] text-secondary mt-0.5">Free sandbox execution</p>
                </div>
                <span className="bg-[#e6f4ea] text-[#137333] text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
