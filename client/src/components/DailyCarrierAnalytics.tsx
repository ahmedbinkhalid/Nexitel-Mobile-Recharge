import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, BarChart3, Activity } from "lucide-react";
import { useState } from "react";

// Component for daily carrier analytics with charts and stats
export function DailyCarrierAnalytics() {
  const [selectedDays, setSelectedDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'activations' | 'recharges'>('activations');

  // Fetch daily activations by carrier
  const { data: activationsData, isLoading: loadingActivations } = useQuery({
    queryKey: ['/api/analytics/daily-activations', selectedDays],
    queryFn: () => fetch(`/api/analytics/daily-activations?days=${selectedDays}`).then(res => res.json()),
    enabled: activeTab === 'activations'
  });

  // Fetch daily recharges by carrier
  const { data: rechargesData, isLoading: loadingRecharges } = useQuery({
    queryKey: ['/api/analytics/daily-recharges', selectedDays],
    queryFn: () => fetch(`/api/analytics/daily-recharges?days=${selectedDays}`).then(res => res.json()),
    enabled: activeTab === 'recharges'
  });

  const currentData = activeTab === 'activations' ? activationsData : rechargesData;
  const isLoading = activeTab === 'activations' ? loadingActivations : loadingRecharges;

  // Calculate totals and trends for carriers
  const calculateCarrierStats = (data: any[]) => {
    if (!data || data.length === 0) return {};

    const carriers = activeTab === 'activations' 
      ? ['Nexitel Blue', 'Nexitel Purple', 'AT&T']
      : ['Nexitel Blue', 'Nexitel Purple', 'AT&T', 'Global Recharge', 'USA Carriers'];

    return carriers.reduce((acc, carrier) => {
      const total = data.reduce((sum, day) => sum + (day[carrier] || 0), 0);
      const recentDays = data.slice(-3);
      const olderDays = data.slice(0, -3);
      
      const recentAvg = recentDays.length > 0 ? 
        recentDays.reduce((sum, day) => sum + (day[carrier] || 0), 0) / recentDays.length : 0;
      const olderAvg = olderDays.length > 0 ? 
        olderDays.reduce((sum, day) => sum + (day[carrier] || 0), 0) / olderDays.length : 0;

      let trend = 'neutral';
      if (recentAvg > olderAvg * 1.1) trend = 'up';
      else if (recentAvg < olderAvg * 0.9) trend = 'down';

      acc[carrier] = { total, trend, recentAvg: Math.round(recentAvg * 10) / 10 };
      return acc;
    }, {} as Record<string, { total: number; trend: string; recentAvg: number }>);
  };

  const carrierStats = calculateCarrierStats(currentData || []);

  // Get carrier colors
  const getCarrierColor = (carrier: string) => {
    switch (carrier) {
      case 'Nexitel Blue': return 'bg-blue-500';
      case 'Nexitel Purple': return 'bg-purple-500';
      case 'AT&T': return 'bg-orange-500';
      case 'Global Recharge': return 'bg-green-500';
      case 'USA Carriers': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return <div className="text-center text-gray-500">No data available</div>;

    const carriers = activeTab === 'activations' 
      ? ['Nexitel Blue', 'Nexitel Purple', 'AT&T']
      : ['Nexitel Blue', 'Nexitel Purple', 'AT&T', 'Global Recharge', 'USA Carriers'];

    const maxValue = Math.max(...data.flatMap(day => 
      carriers.map(carrier => day[carrier] || 0)
    ));

    return (
      <div className="space-y-4">
        {/* Chart Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          {carriers.map(carrier => (
            <div key={carrier} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getCarrierColor(carrier)}`}></div>
              <span className="text-gray-600">{carrier}</span>
            </div>
          ))}
        </div>

        {/* Simple Bar Chart */}
        <div className="grid grid-cols-7 gap-2 h-32">
          {data.slice(-7).map((day, index) => (
            <div key={day.date} className="flex flex-col items-center">
              <div className="flex-1 flex flex-col justify-end w-full space-y-1">
                {carriers.map(carrier => {
                  const value = day[carrier] || 0;
                  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  return (
                    <div
                      key={carrier}
                      className={`${getCarrierColor(carrier)} rounded-sm min-h-[2px]`}
                      style={{ height: `${height}%` }}
                      title={`${carrier}: ${value}`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(day.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-5 h-5" />
              Daily Carrier Analytics
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Track daily {activeTab} across all carriers
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Tab Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={activeTab === 'activations' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('activations')}
                className="text-xs px-3"
              >
                <Activity className="w-3 h-3 mr-1" />
                Activations
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'recharges' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('recharges')}
                className="text-xs px-3"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Recharges
              </Button>
            </div>

            {/* Days Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[7, 14, 30].map(days => (
                <Button
                  key={days}
                  size="sm"
                  variant={selectedDays === days ? 'default' : 'ghost'}
                  onClick={() => setSelectedDays(days)}
                  className="text-xs px-3"
                >
                  {days}d
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Daily {activeTab} trends (Last {selectedDays} days)
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <SimpleBarChart data={currentData || []} />
            )}
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Carrier Performance ({selectedDays} days)
            </h4>
            {Object.entries(carrierStats).map(([carrier, stats]) => (
              <div key={carrier} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded ${getCarrierColor(carrier)}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{carrier}</p>
                    <p className="text-xs text-gray-600">Avg: {stats.recentAvg}/day</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{stats.total}</span>
                  {getTrendIcon(stats.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>


      </CardContent>
    </Card>
  );
}