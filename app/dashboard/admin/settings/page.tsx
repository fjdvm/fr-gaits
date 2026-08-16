import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <>
      <DashboardHeader title="Platform Settings" description="Configure platform-wide settings." />
      <main className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Default AI provider keys are configured via environment variables on the server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">GROQ_API_KEY</p>
                <p className="text-xs text-muted-foreground">Default AI provider for the tutor</p>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {process.env.GROQ_API_KEY ? "Configured ✓" : "Not Set ✗"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <p className="font-medium">GOOGLE_GENERATIVE_AI_API_KEY</p>
                <p className="text-xs text-muted-foreground">Fallback AI provider</p>
              </div>
              <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                {process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "Configured ✓" : "Not Set ✗"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">ENCRYPTION_KEY</p>
                <p className="text-xs text-muted-foreground">Used to encrypt instructor API keys</p>
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
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Active</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
