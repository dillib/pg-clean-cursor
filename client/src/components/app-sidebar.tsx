import { Link, useLocation } from "wouter";
import { Package, LayoutDashboard, Plus, LogOut, QrCode, Wifi, Plug, ArrowLeftRight, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  internalOnly?: boolean;
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "IoT Devices",
    url: "/iot-devices",
    icon: Wifi,
  },
  {
    title: "SAP Connector",
    url: "/integrations/sap",
    icon: Plug,
  },
  {
    title: "SAP Demo",
    url: "/integrations/sap-demo",
    icon: ArrowLeftRight,
  },
  {
    title: "Create Product",
    url: "/products/new",
    icon: Plus,
  },
  {
    title: "CRM & Tools",
    url: "/admin",
    icon: Settings2,
    internalOnly: true,
  },
  {
    title: "Internal Ops",
    url: "/admin/internal",
    icon: Settings2,
    adminOnly: true,
  },
];

interface AppSidebarProps {
  mode?: "admin" | "demo" | "internal";
  teamUser?: { firstName?: string; lastName?: string; email?: string } | null;
  onLogout?: () => void;
}

export function AppSidebar({ mode = "admin", teamUser, onLogout }: AppSidebarProps) {
  const [location] = useLocation();
  const { user, logout, isLoggingOut } = useAuth();

  const isDemo = mode === "demo";
  const isInternal = mode === "internal";
  const isTeamMode = isDemo || isInternal;
  const displayUser = isTeamMode ? teamUser : user;

  const getInitials = () => {
    if (displayUser?.firstName && displayUser?.lastName) {
      return `${displayUser.firstName[0]}${displayUser.lastName[0]}`.toUpperCase();
    }
    if (displayUser?.email) {
      return displayUser.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (displayUser?.firstName && displayUser?.lastName) {
      return `${displayUser.firstName} ${displayUser.lastName}`;
    }
    if (displayUser?.firstName) {
      return displayUser.firstName;
    }
    if (displayUser?.email) {
      return displayUser.email;
    }
    return "User";
  };

  const filteredItems = navigationItems.filter((item) => {
    if (isDemo) return !item.adminOnly && !item.internalOnly;
    if (isInternal) return !item.adminOnly;
    return !item.internalOnly;
  });

  const getPrefix = () => {
    if (isDemo) return "/demo";
    if (isInternal) return "/internal";
    return "";
  };
  const prefix = getPrefix();

  const homeUrl = isDemo ? "/demo/dashboard" : isInternal ? "/internal/dashboard" : "/";

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href={homeUrl} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">PhotonicTag</span>
            <span className="text-xs text-muted-foreground">Identity, at the speed of light.</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const itemUrl = isTeamMode
                  ? (item.url === "/" ? `${prefix}/dashboard` : `${prefix}${item.url}`)
                  : item.url;
                const isActive = location === itemUrl || 
                  (itemUrl !== "/" && itemUrl !== `${prefix}/dashboard` && location.startsWith(itemUrl));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={itemUrl} data-testid={`nav-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {displayUser && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as any)?.profileImageUrl || undefined} alt={getDisplayName()} />
                <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                {displayUser.email && (
                  <p className="text-xs text-muted-foreground truncate">{displayUser.email}</p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2"
              onClick={() => isTeamMode && onLogout ? onLogout() : logout()}
              disabled={!isTeamMode && isLoggingOut}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span>{!isDemo && isLoggingOut ? "Logging out..." : "Log out"}</span>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
