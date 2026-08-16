import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiKeyManagementCard } from "@/components/features/admin-settings/api-key-management-card";

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
      <DashboardHeader title="Platform Settings" description="Configure platform-wide settings." />
      <main className="p-6 space-y-6">
        <ApiKeyManagementCard initialKeys={apiKeys} />

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              Server-side environment variable status (read-only).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">ENCRYPTION_KEY</p>
                <p className="text-xs text-muted-foreground">Used to encrypt API keys</p>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {process.env.ENCRYPTION_KEY ? "Configured ✓" : "Not Set ✗"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Judge0 Configuration</CardTitle>
            <CardDescription>Code execution is powered by Judge0 Cloud API.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Judge0 Cloud (ce.judge0.com)</p>
                <p className="text-xs text-muted-foreground">Free tier: 100 submissions/day</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
