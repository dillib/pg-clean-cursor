import { Link, useLocation } from "wouter";
import { usePrefixedLink } from "@/hooks/use-route-prefix";
import { cn } from "@/lib/utils";
import { Settings2, Activity, Server } from "lucide-react";

const tabs = [
  { path: "/integrations/sap", label: "Connector", icon: Settings2, testId: "hub-tab-connector" },
  { path: "/integrations/sap-operations", label: "Operations", icon: Activity, testId: "hub-tab-operations" },
  { path: "/integrations/sap-demo", label: "Demo", icon: Server, testId: "hub-tab-demo" },
] as const;

export function SAPHubNav() {
  const [location] = useLocation();
  const withPrefix = usePrefixedLink();

  return (
    <nav
      aria-label="SAP integration sections"
      className="border-b bg-muted/20 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-6"
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        {tabs.map(({ path, label, icon: Icon, testId }) => {
          const href = withPrefix(path);
          const isActive = location === href;
          return (
            <Link
              key={path}
              href={href}
              data-testid={testId}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
