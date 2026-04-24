import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function SuppliersPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Helmet>
        <title>Suppliers · PhotonicTag</title>
      </Helmet>
      <PageHeader
        eyebrow="Network"
        title="Suppliers"
        description="Invite suppliers, scope fields they can complete, and track pending passport data."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming next</CardTitle>
          <CardDescription>
            Supplier portals and scoped edits are specified in the design-system HANDOFF. The core tenancy layer is in
            place — this UI will connect to supplier accounts and workflows in a follow-up release.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Until then, capture supplier attestations in product notes or attach evidence files on each passport record.
        </CardContent>
      </Card>
    </div>
  );
}
