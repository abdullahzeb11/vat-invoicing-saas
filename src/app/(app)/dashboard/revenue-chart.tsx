"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface RevenueChartDatum {
  label: string;
  total: number;
}

export function RevenueChart({ data, currency }: { data: RevenueChartDatum[]; currency: string }) {
  const empty = useMemo(() => data.every((d) => d.total === 0), [data]);

  if (empty) {
    return (
      <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
        No revenue in the last 6 months yet.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => Intl.NumberFormat("en", { notation: "compact" }).format(v)}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) =>
              [Intl.NumberFormat("en", { style: "currency", currency }).format(v), "Revenue"] as [
                string,
                string
              ]
            }
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            fill="url(#fillRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
