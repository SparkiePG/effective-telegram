import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface PricePoint {
  price: number;
  recordedAt: string;
}

export function PriceChart() {
  const { data: history, isLoading } = useQuery<PricePoint[]>({
    queryKey: ["/api/price/history"],
    refetchInterval: 10000,
  });

  if (isLoading || !history || history.length === 0) {
    return (
      <Card className="p-6 rounded-3xl bg-card/80 border-border/30">
        <div className="h-[200px] flex items-center justify-center">
          <div className="h-full w-full rounded-xl bg-muted/30 animate-pulse" />
        </div>
      </Card>
    );
  }

  const labels = history.map((p) => {
    const d = new Date(p.recordedAt);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const prices = history.map((p) => p.price);
  const isUp = prices.length > 1 && prices[prices.length - 1] >= prices[0];
  const pctChange = prices.length > 1 && prices[0] > 0
    ? (((prices[prices.length - 1] - prices[0]) / prices[0]) * 100)
    : 0;

  const chartData = {
    labels,
    datasets: [
      {
        data: prices,
        borderColor: isUp ? "#34d399" : "#f87171",
        backgroundColor: isUp
          ? "rgba(52, 211, 153, 0.08)"
          : "rgba(248, 113, 113, 0.08)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: isUp ? "#34d399" : "#f87171",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => `$${Number(ctx.raw).toFixed(8)}`,
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: "rgba(255,255,255,0.3)",
          font: { size: 10 },
          maxTicksLimit: 6,
        },
        border: { display: false },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
        ticks: {
          color: "rgba(255,255,255,0.3)",
          font: { size: 10 },
          callback: (val: any) => `$${Number(val).toFixed(8)}`,
          maxTicksLimit: 5,
        },
        border: { display: false },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  return (
    <Card className="p-6 rounded-3xl bg-card/80 border-border/30" data-testid="card-price-chart">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">$XDORO Price</p>
          <p className="text-xl font-bold mt-1" data-testid="text-price-current">
            ${history[history.length - 1]?.price.toFixed(8)}
          </p>
        </div>
        <span
          className={`text-sm font-semibold px-2.5 py-1 rounded-full ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
          data-testid="text-price-change"
        >
          {isUp ? "+" : ""}{pctChange.toFixed(2)}%
        </span>
      </div>
      <div style={{ height: "200px" }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}
