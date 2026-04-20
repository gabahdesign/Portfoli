"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ActivityChartProps {
  data: { date: string; count: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  // If no data, render an empty state or just a line at 0
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-[var(--color-muted)] text-sm border border-dashed border-[var(--color-border)] rounded-xl">
        No hi ha dades suficients per mostrar el gràfic.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
            minTickGap={20}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--color-muted)' }} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-surface)', 
              borderColor: 'var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-text)'
            }}
            itemStyle={{ color: 'var(--color-accent)', fontWeight: 'bold' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} visites`, 'Activitat'] as any}
            labelStyle={{ color: 'var(--color-muted)', marginBottom: '5px' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="var(--color-accent)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCount)" 
            activeDot={{ r: 6, fill: "var(--color-accent)", stroke: "var(--color-bg)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
