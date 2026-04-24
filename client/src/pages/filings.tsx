import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function FilingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Helmet>
        <title>Filings · PhotonicTag</title>
      </Helmet>
      <PageHeader
        eyebrow="Market surveillance"
        title="Filings"
        description="Export signed compliance packs for authorities — PDF bundles with passport snapshots and audit excerpts."
      />
      <Card>
        <CardHeader>
          <CardTitle>Planned export</CardTitle>
          <CardDescription>
            Signed PDF filings with eIDAS-ready timestamps will bundle selected passport versions plus audit chain excerpts.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use the audit integrity API today for regulator-grade verification; UI-driven filing exports will land here.
        </CardContent>
      </Card>
    </div>
  );
}
