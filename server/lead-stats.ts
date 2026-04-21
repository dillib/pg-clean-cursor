import type { Lead } from "@shared/schema";

export type LeadStatsSummary = {
  total: number;
  byStatus: Record<string, number>;
  byTier: Record<string, number>;
  bySource: Record<string, number>;
  thisWeek: number;
  lastWeek: number;
};

/** Pure aggregation for one tenant's lead rows (O(n) over the provided array). */
export function computeLeadStatsFromLeads(allLeads: Lead[]): LeadStatsSummary {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const byStatus: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let thisWeek = 0;
  let lastWeek = 0;

  for (const lead of allLeads) {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    byTier[lead.tierInterest] = (byTier[lead.tierInterest] || 0) + 1;
    bySource[lead.source] = (bySource[lead.source] || 0) + 1;

    const createdAt = new Date(lead.createdAt);
    if (createdAt >= weekAgo) {
      thisWeek++;
    } else if (createdAt >= twoWeeksAgo) {
      lastWeek++;
    }
  }

  return {
    total: allLeads.length,
    byStatus,
    byTier,
    bySource,
    thisWeek,
    lastWeek,
  };
}
