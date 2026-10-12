"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_CHART_COLOR, STATUS_LABEL } from "../status";
import type { ChartDay } from "../types";

const chartConfig = {
  completed: { label: STATUS_LABEL.COMPLETED, color: STATUS_CHART_COLOR.COMPLETED },
  partial: { label: STATUS_LABEL.PARTIAL, color: STATUS_CHART_COLOR.PARTIAL },
  notCompleted: {
    label: STATUS_LABEL.NOT_COMPLETED,
    color: STATUS_CHART_COLOR.NOT_COMPLETED,
  },
  unrecorded: { label: STATUS_LABEL.UNRECORDED, color: STATUS_CHART_COLOR.UNRECORDED },
} satisfies ChartConfig;

function formatTooltipDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function WeeklyChart({ data }: { data: ChartDay[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Last 7 days</CardTitle>
        <CardDescription>Expected activities and recorded outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 4, left: 0, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const day = payload?.[0]?.payload as ChartDay | undefined;
                    return day ? formatTooltipDate(day.date) : null;
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" />
            <Bar dataKey="partial" stackId="a" fill="var(--color-partial)" />
            <Bar dataKey="notCompleted" stackId="a" fill="var(--color-notCompleted)" />
            <Bar
              dataKey="unrecorded"
              stackId="a"
              fill="var(--color-unrecorded)"
              fillOpacity={0.4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
