import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
 
interface FoodItem {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  freshness_score: number;
  freshness_status: "fresh" | "at_risk" | "spoiled";
  confidence: number;
  detected_at: string;
  estimated_days_to_spoil: number | null;
  storage_tips: string[] | null;
}
 
interface SensorReading {
  id: string;
  humidity: number | null;
  temperature: number | null;
  gas_value: number | null;
  mq135_gas_level?: number | null;
  mq3_gas_level?: number | null;
  recorded_at: string;
  food_item_id: string | null;
}
 
type GenericRecord = Record<string, unknown>;
 
const parseNumeric = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};
 
const pickNumeric = (source: GenericRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const parsed = parseNumeric(source[key]);
    if (parsed !== null) return parsed;
  }
  return null;
};
 
const normalizeSensorReading = (reading: unknown): SensorReading => {
  const source = (reading ?? {}) as GenericRecord;
  const rawFoodItemId = source.food_item_id;
 
  const mq135 = pickNumeric(source, [
    "mq135_gas_level",
    "mq135_gas_value",
    "MQ135_gas_value",
    "mq135",
    "MQ135",
  ]);
  const mq3 = pickNumeric(source, [
    "mq3_gas_level",
    "mq3_gas_value",
    "MQ3_gas_value",
    "mq3",
    "MQ3",
  ]);
 
  return {
    id: String(source.id ?? ""),
    humidity: parseNumeric(source.humidity),
    temperature: parseNumeric(source.temperature),
    gas_value: parseNumeric(source.gas_value) ?? mq135,
    mq135_gas_level: mq135,
    mq3_gas_level: mq3,
    recorded_at: String(source.recorded_at ?? ""),
    food_item_id: typeof rawFoodItemId === "string" ? rawFoodItemId : null,
  };
};
 
interface Notification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info";
  is_read: boolean;
  created_at: string;
  food_item_id: string | null;
}
 
export const useDashboardData = () => {
  const { user } = useAuth();
  const backendUrl = (import.meta.env.VITE_BACKEND_API_URL as string | undefined)?.replace(/\/+$/, "");
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
 
  const fetchData = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
 
    const [itemsRes, readingRes, notifsRes] = await Promise.all([
      supabase.from("food_items").select("*").order("detected_at", { ascending: false }),
      supabase.from("sensor_readings").select("*").order("recorded_at", { ascending: false }).limit(1),
      supabase.from("notifications").select("*").order("created_at", { ascending: false }),
    ]);
 
    if (itemsRes.data) setFoodItems(itemsRes.data as FoodItem[]);
    if (readingRes.data && readingRes.data.length > 0) setLatestReading(normalizeSensorReading(readingRes.data[0]));
    if (notifsRes.data) setNotifications(notifsRes.data as Notification[]);
    setLoading(false);
    setRefreshing(false);
    setLastRefreshed(new Date());
  }, [user]);
 
  useEffect(() => {
    fetchData();
 
    // Real-time subscriptions (unique channel names per hook instance)
    const suffix = `${Math.random().toString(36).slice(2)}-${Date.now()}`;
    const foodChannel = supabase
      .channel(`food-items-changes-${suffix}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "food_items" }, () => fetchData())
      .subscribe();
 
    const sensorChannel = supabase
      .channel(`sensor-readings-changes-${suffix}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sensor_readings" }, () => fetchData())
      .subscribe();
 
    const notifChannel = supabase
      .channel(`notifications-changes-${suffix}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchData())
      .subscribe();
 
    let eventSource: EventSource | null = null;
    if (backendUrl && user?.id) {
      fetch(`${backendUrl}/api/dashboard/${user.id}/latest`)
        .then((res) => res.json())
        .then((snapshot) => {
          if (snapshot?.latest_reading) {
            setLatestReading(normalizeSensorReading(snapshot.latest_reading));
          }
        })
        .catch(() => {
          // Keep UI resilient; Supabase polling/realtime still works.
        });
 
      eventSource = new EventSource(`${backendUrl}/api/stream/${user.id}`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const payload = parsed?.payload;
          if (payload?.latest_reading) {
            setLatestReading(normalizeSensorReading(payload.latest_reading));
          }
          // Sync canonical entities from Supabase after live ingestion notice.
          fetchData();
        } catch {
          // Ignore malformed SSE events.
        }
      };
    }
 
    return () => {
      supabase.removeChannel(foodChannel);
      supabase.removeChannel(sensorChannel);
      supabase.removeChannel(notifChannel);
      if (eventSource) eventSource.close();
    };
  }, [user, backendUrl, fetchData]);
 
  const wrappedRefetch = async () => {
    if (refreshing) return;
    if (backendUrl) {
      try {
        await fetch(`${backendUrl}/api/edge/trigger`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "dashboard-refresh-button" }),
        });
      } catch {
        // If manual trigger API is unavailable, still refresh current data.
      }
    }
    await fetchData();
  };
 
  const freshCount = foodItems.filter((i) => i.freshness_status === "fresh").length;
  const atRiskCount = foodItems.filter((i) => i.freshness_status === "at_risk").length;
  const spoiledCount = foodItems.filter((i) => i.freshness_status === "spoiled").length;
  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;
 
  return { foodItems, latestReading, notifications, loading, refreshing, lastRefreshed, freshCount, atRiskCount, spoiledCount, unreadNotifCount, refetch: wrappedRefetch };
};