import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Droplets, Thermometer, Clock, Leaf, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const statusConfig = {
  fresh: { label: "FRESHNESS DETECTED", className: "bg-primary text-primary-foreground" },
  at_risk: { label: "EXPIRING SOON", className: "bg-warning text-warning-foreground" },
  spoiled: { label: "SPOILED", className: "bg-destructive text-destructive-foreground" },
};

const ItemDetail = ({ itemId }: { itemId: string }) => {
  const { foodItems, inferenceByFoodItem } = useDashboardData();
  const navigate = useNavigate();
  const item = foodItems.find((i) => i.id === itemId);
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    if (itemId) {
      supabase
        .from("sensor_readings")
        .select("*")
        .eq("food_item_id", itemId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data) setReadings(data);
        });
    }
  }, [itemId]);

  if (!item) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Item not found.</p>
        <button onClick={() => navigate("/items")} className="text-primary hover:underline mt-2">Back to items</button>
      </div>
    );
  }

  const sc = statusConfig[item.freshness_status];
  const reading = readings[0];
  const timeSince = item.detected_at ? getTimeSince(item.detected_at) : "Unknown";
  const inference = inferenceByFoodItem[item.id];

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate("/items")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Items
      </button>

      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
          <div className="shrink-0">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-40 w-40 rounded-xl object-cover border border-primary/20" />
            ) : (
              <div className="h-40 w-40 rounded-xl bg-accent flex items-center justify-center">
                <Leaf className="h-12 w-12 text-accent-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground">{item.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">{item.category} • Detected {timeSince}</p>
          </div>
          <div className="flex flex-col gap-2 items-start md:items-end w-full md:w-auto mt-4 md:mt-0">
            <Badge className={sc.className + " text-sm px-4 py-1.5"}>{sc.label}</Badge>
            <Badge variant="outline" className="border-primary text-primary">Freshness Confidence: {item.confidence}%</Badge>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-lg font-bold text-foreground">Storage Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="h-5 w-5 text-accent-foreground" />
              <span className="font-semibold text-foreground">Humidity</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium text-primary">{reading?.humidity ?? "--"}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="h-5 w-5 text-warning" />
              <span className="font-semibold text-foreground">Temperature</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-medium text-warning">{reading?.temperature ?? "--"} °C</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-accent-foreground" />
              <span className="font-semibold text-foreground">Shelf Life</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. days left:</span>
              <span className="font-medium text-primary">{item.estimated_days_to_spoil ?? "--"} days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {inference && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-foreground mb-3">Final Fusion Output</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Final Status</p>
                <p className="font-semibold">{inference.final_status}</p>
                <p className="text-xs text-muted-foreground mt-1">Score: {inference.final_score ?? "--"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Vision Model</p>
                <p className="font-semibold">{inference.vision_status ?? "--"}</p>
                <p className="text-xs text-muted-foreground mt-1">Confidence: {inference.vision_confidence ?? "--"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Sensor Model</p>
                <p className="font-semibold">{inference.sensor_status ?? "--"}</p>
                <p className="text-xs text-muted-foreground mt-1">Confidence: {inference.sensor_confidence ?? "--"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Gas Trend</p>
                <p className="font-semibold">{inference.gas_trend_status ?? "--"}</p>
                <p className="text-xs text-muted-foreground mt-1">Captured: {inference.captured_at ? getTimeSince(inference.captured_at) : "--"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {item.storage_tips && item.storage_tips.length > 0 && (
        <Card className="bg-accent/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-accent-foreground" />
              <h3 className="font-bold text-foreground">Storage Tips</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {item.storage_tips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ItemsList = () => {
  const { foodItems, inferenceByFoodItem, loading } = useDashboardData();
  const navigate = useNavigate();

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Item Details</h1>
        <p className="text-muted-foreground">View detailed information about your detected food items.</p>
      </div>
      {foodItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No items detected yet. Your IoT device will push data here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {foodItems.map((item) => {
            const sc = statusConfig[item.freshness_status] || statusConfig.fresh;
            return (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/items/${item.id}`)}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
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
                      <div className="text-xs text-muted-foreground">Confidence: {item.confidence}% • {item.estimated_days_to_spoil ? `${item.estimated_days_to_spoil} days left` : "N/A"}</div>
                      {inferenceByFoodItem[item.id] && (
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Final: {inferenceByFoodItem[item.id].final_status} | Vision: {inferenceByFoodItem[item.id].vision_status ?? "--"} | Sensor: {inferenceByFoodItem[item.id].sensor_status ?? "--"}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={sc.className}>{sc.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Items = () => {
  const { id } = useParams();

  return (
    <DashboardLayout>
      {id ? <ItemDetail itemId={id} /> : <ItemsList />}
    </DashboardLayout>
  );
};

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default Items;
