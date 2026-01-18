'use client';

import { TrendingUp } from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { ProgressData } from '@/lib/types';

interface ProgressOverviewProps {
  data: ProgressData[];
}

const chartConfig = {
  totalWeight: {
    label: 'Peso Total',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function ProgressOverview({ data }: ProgressOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Seu Progresso</CardTitle>
        <CardDescription>
          Aqui está uma visão do seu peso total levantado nas últimas semanas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Line
              dataKey="Total Weight"
              type="monotone"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: 'hsl(var(--primary))',
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
