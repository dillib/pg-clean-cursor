import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Mono } from "@/components/brand/brand";

export default function DeveloperApiPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Helmet>
        <title>API keys & webhooks · PhotonicTag</title>
      </Helmet>
      <PageHeader
        eyebrow="Developers"
        title="API keys & webhooks"
        description="Programmatic access for your tenant — same auth session as the console today; dedicated keys next."
      />
      <Card>
        <CardHeader>
          <CardTitle>Current integration path</CardTitle>
          <CardDescription>Server routes under /api require an authenticated session cookie or partner session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Long-lived <Mono>API keys</Mono> and outbound <Mono>webhooks</Mono> (passport published, sync failed, etc.) are
            tracked for implementation after the first pilot tenants stabilize on session-based access.
          </p>
          <p>
            Configure <Mono>AI_ENDPOINT_REGION=eu</Mono> and EU-hosted inference endpoints via <Mono>AI_PROVIDER</Mono> /{" "}
            <Mono>AI_BASE_URL</Mono> for data residency-sensitive workloads.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
