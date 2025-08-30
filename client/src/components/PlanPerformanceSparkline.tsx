import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type PlanPerformanceMetric } from "@shared/schema";

interface PlanPerformanceSparklineProps {
  planId: number;
  planName: string;
  className?: string;
}

export default function PlanPerformanceSparkline({ 
  planId, 
  planName, 
  className = "" 
}: PlanPerformanceSparklineProps) {
  const { data: metrics = [], isLoading } = useQuery<PlanPerformanceMetric[]>({
    queryKey: ["/api/plans", planId, "performance"],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
  });

  if (isLoading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{planName}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{planName}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center text-gray-500 text-sm">No performance data</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate trends and key metrics
  const latestMetric = metrics[metrics.length - 1];
  const previousMetric = metrics[metrics.length - 2];
  
  const revenueData = metrics.map(m => ({
    date: new Date(m.date || new Date()).toLocaleDateString(),
    revenue: parseFloat(m.revenue || "0"),
    profit: parseFloat(m.profit || "0"),
    transactions: m.transactionCount || 0,
    successRate: parseFloat(m.successRate || "100"),
  }));

  const revenueTrend = previousMetric 
    ? ((parseFloat(latestMetric.revenue || "0") - parseFloat(previousMetric.revenue || "0")) / parseFloat(previousMetric.revenue || "1")) * 100
    : 0;

  const transactionTrend = previousMetric
    ? (((latestMetric.transactionCount || 0) - (previousMetric.transactionCount || 0)) / (previousMetric.transactionCount || 1)) * 100
    : 0;

  const totalRevenue = metrics.reduce((sum, m) => sum + parseFloat(m.revenue || "0"), 0);
  const totalTransactions = metrics.reduce((sum, m) => sum + (m.transactionCount || 0), 0);
  const avgSuccessRate = metrics.reduce((sum, m) => sum + parseFloat(m.successRate || "100"), 0) / metrics.length;

  return (
    <Card className={`${className} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate">{planName}</CardTitle>
          <Badge 
            variant={avgSuccessRate >= 98 ? "default" : avgSuccessRate >= 95 ? "secondary" : "destructive"}
            className="text-xs"
          >
            {avgSuccessRate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {/* Sparkline Chart */}
        <div className="h-16 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#3b82f6" }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-lg text-xs">
                        <p className="font-medium">{label}</p>
                        <p className="text-blue-600">Revenue: ${data.revenue.toFixed(2)}</p>
                        <p className="text-green-600">Profit: ${data.profit.toFixed(2)}</p>
                        <p className="text-purple-600">Transactions: {data.transactions}</p>
                        <p className="text-orange-600">Success: {data.successRate.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
            <span className="font-medium">${totalRevenue.toFixed(0)}</span>
            {revenueTrend !== 0 && (
              <span className={`flex items-center ${revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(revenueTrend).toFixed(1)}%
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">Txns:</span>
            <span className="font-medium">{totalTransactions}</span>
            {transactionTrend !== 0 && (
              <span className={`flex items-center ${transactionTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transactionTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(transactionTrend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">30-day performance</span>
            <div className="flex items-center space-x-1">
              <div 
                className={`w-2 h-2 rounded-full ${
                  avgSuccessRate >= 98 ? 'bg-green-500' : 
                  avgSuccessRate >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
              <span className="font-medium">
                {avgSuccessRate >= 98 ? 'Excellent' : 
                 avgSuccessRate >= 95 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}