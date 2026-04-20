import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, AlertCircle, Droplets, Thermometer, Wind, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  fresh: { label: "FRESH", className: "bg-primary text-primary-foreground" },
  at_risk: { label: "USE SOON", className: "bg-warning text-warning-foreground" },
  spoiled: { label: "SPOILED", className: "bg-destructive text-destructive-foreground" },
};

const Index = () => {
  const { foodItems, latestReading, freshCount, atRiskCount, spoiledCount, loading } = useDashboardData();
  const navigate = useNavigate();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to FreshSense</h1>
          <p className="text-muted-foreground">Your smart companion for fresher food and less waste.</p>
        </div>

        {/* Welcome banner */}
        <div className="rounded-xl bg-primary p-6 text-primary-foreground relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Welcome to FreshSense</h2>
            <p className="text-sm opacity-90 max-w-2xl">
              FreshSense continuously monitors your stored food using cameras, detection and environmental sensors, giving you real-time insights into the condition of every item. Get instant alerts when something needs your attention before it's too late.
            </p>
          </div>
          <div className="absolute right-6 top-4 opacity-20">
            <Leaf className="h-24 w-24" />
          </div>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Fresh Items</div>
                  <div className="text-xs text-muted-foreground">In good condition</div>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary">{freshCount}</span>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">At Risk</div>
                  <div className="text-xs text-muted-foreground">Use soon</div>
                </div>
              </div>
              <span className="text-3xl font-bold text-warning">{atRiskCount}</span>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Spoiled Items</div>
                  <div className="text-xs text-muted-foreground">Needs removal</div>
                </div>
              </div>
              <span className="text-3xl font-bold text-destructive">{spoiledCount}</span>
            </CardContent>
          </Card>
        </div>

        {/* Real-time sensor readings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Real-Time Information Collection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-accent p-5 text-center">
                <Droplets className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
                <div className="text-sm font-medium text-accent-foreground">Humidity</div>
                <div className="text-2xl font-bold text-foreground mt-1">{latestReading?.humidity ?? "--"}%</div>
              </div>
              <div className="rounded-xl bg-warning/15 p-5 text-center">
                <Thermometer className="h-6 w-6 mx-auto mb-2 text-warning" />
                <div className="text-sm font-medium text-warning">Temperature</div>
                <div className="text-2xl font-bold text-foreground mt-1">{latestReading?.temperature ?? "--"} °C</div>
              </div>
              <div className="rounded-xl bg-destructive/10 p-5 text-center">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                <div className="text-sm font-medium text-destructive">Gas Value</div>
                <div className="text-2xl font-bold text-foreground mt-1">{latestReading?.gas_value ?? "--"}</div>
              </div>
              <div className="rounded-xl bg-accent p-5 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
                <div className="text-sm font-medium text-accent-foreground">Fresh Items</div>
                <div className="text-2xl font-bold text-foreground mt-1">{freshCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detected items */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Detected Items</h3>
              <button onClick={() => navigate("/items")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                View All
              </button>
            </div>
            {foodItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No food items detected yet. Your IoT device will push data here.</p>
            ) : (
              <div className="space-y-3">
                {foodItems.slice(0, 5).map((item) => {
                  const sc = statusConfig[item.freshness_status];
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 p-4 rounded-xl border cursor-pointer hover:shadow-sm transition-shadow ${
                        item.freshness_status === "spoiled" ? "border-destructive/30 bg-destructive/5" :
                        item.freshness_status === "at_risk" ? "border-warning/30 bg-warning/5" :
                        "border-primary/20 bg-primary/5"
                      }`}
                      onClick={() => navigate(`/items/${item.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                            <Leaf className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-foreground">{item.name}</div>
                          <div className="text-xs text-muted-foreground">Confidence: {item.confidence}%</div>
                        </div>
                      </div>
                      <Badge className={sc.className}>{sc.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
