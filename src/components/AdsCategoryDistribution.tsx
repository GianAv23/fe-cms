import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useSWR from "swr";

type AdsCategoryDistribution = {
  category: "INTERNAL" | "EXTERNAL";
  count: number;
};

const chartData = [
  { category: "INTERNAL", count: 0, fill: "var(--chart-3)" },
  { category: "EXTERNAL", count: 0, fill: "var(--chart-4)" },
];

const chartConfig = {
  count: {
    label: "Category",
  },
  INTERNAL: {
    label: "Internal",
    color: "var(--chart-3)",
  },
  EXTERNAL: {
    label: "External",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const AdsCategoryDistribution = () => {
  const { data: AdsCategoryDistribution } = useSWR<AdsCategoryDistribution[]>(
    `/ads/stats/categorydistribution`,
  );

  const mappedData = AdsCategoryDistribution
    ? AdsCategoryDistribution.map((item: AdsCategoryDistribution) => ({
        category: item.category,
        count: item.count,
        fill: chartConfig[item.category]?.color || "var(--chart-3)",
      }))
    : chartData;

  return (
    <Card className="bg-sidebar gap-0 border-[0.5px] py-0 shadow-none">
      <CardHeader className="gap-1 rounded-t-xl px-3 py-4">
        <CardTitle className="text-md lg:text-lg">
          Ads Category Distribution
        </CardTitle>
        <CardDescription className="text-xs lg:text-base">
          Show distribution of ads based on category
        </CardDescription>
      </CardHeader>
      <CardContent className="rounded-xl border-t-[0.5px] bg-white px-3 shadow-[0px_-10px_18px_-13px_rgba(0,_0,_0,_0.1)]">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square h-[400px] w-full pb-0 lg:h-[400px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={mappedData} dataKey="count" label nameKey="category" />
            <ChartLegend
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="flex flex-wrap justify-center gap-4">
                    {payload?.map((entry, index) => (
                      <div key={`item-${index}`} className="flex items-center">
                        <div
                          className="mr-2 h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">
                          {entry.value}: {(entry.payload as any)?.count}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
              className="text-md -translate-y-2 flex-wrap gap-10 font-normal *:justify-center lg:text-[14px]"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AdsCategoryDistribution;
