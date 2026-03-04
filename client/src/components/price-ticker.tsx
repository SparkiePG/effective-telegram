import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from "lucide-react";

interface PriceData {
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}

export function PriceTicker() {
  const { data, isLoading } = useQuery<PriceData>({
    queryKey: ["/api/price"],
    refetchInterval: 10000,
  });

  const isPositive = (data?.change24h ?? 0) >= 0;

  if (isLoading) {
    return (
      <div className="flex items-center gap-8 flex-wrap justify-center py-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5 sm:gap-8 flex-wrap justify-center py-1" data-testid="price-ticker">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block leading-none mb-0.5">Price</span>
          <span className="font-bold text-base text-foreground">${data?.price?.toFixed(8) ?? "0.00"}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? "bg-green-500/10" : "bg-red-500/10"}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block leading-none mb-0.5">24h Change</span>
          <span className={`font-bold text-base ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}
            {data?.change24h?.toFixed(2) ?? "0.00"}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block leading-none mb-0.5">Market Cap</span>
          <span className="font-bold text-base text-foreground">
            ${data?.marketCap ? (data.marketCap / 1000).toFixed(1) + "K" : "0"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block leading-none mb-0.5">Volume</span>
          <span className="font-bold text-base text-foreground">
            ${data?.volume24h ? (data.volume24h / 1000).toFixed(1) + "K" : "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
