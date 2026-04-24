import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
  loading?: boolean;
  trend?: { value: number; label?: string };
  tone?: "default" | "success" | "warning" | "danger";
  testId?: string;
}

/** Three-color system: state via weight + accent, not chromatic greens/reds */
const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  success: "text-foreground",
  warning: "text-muted-foreground",
  danger: "text-foreground ring-1 ring-yellow ring-inset rounded-sm px-1 -mx-1",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
  trend,
  tone = "default",
  testId,
}: StatCardProps) {
  const TrendIcon = !trend ? null : trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus;
  const trendTone = !trend
    ? ""
    : trend.value > 0
      ? "text-foreground"
      : trend.value < 0
        ? "text-muted-foreground"
        : "text-muted-foreground";

  return (
    <Card className="overflow-hidden" data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground truncate">
          {label}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
      </CardHeader>
      <CardContent className="space-y-1">
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className={cn("text-2xl sm:text-3xl font-bold tabular-nums", toneClasses[tone])}>
            {value}
          </div>
        )}
        <div className="flex items-center gap-2 min-h-[1rem]">
          {trend && TrendIcon && !loading && (
            <span className={cn("inline-flex items-center gap-1 text-xs font-medium", trendTone)}>
              <TrendIcon className="h-3 w-3" aria-hidden />
              {Math.abs(trend.value)}%
              {trend.label && <span className="text-muted-foreground font-normal">{trend.label}</span>}
            </span>
          )}
          {hint && !trend && (
            <p className="text-xs text-muted-foreground truncate">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
