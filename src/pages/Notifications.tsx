import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, AlertCircle, Clock, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const severityConfig = {
  critical: { icon: AlertCircle, color: "border-l-destructive", iconColor: "text-destructive", bg: "bg-destructive/5" },
  warning: { icon: Clock, color: "border-l-warning", iconColor: "text-warning", bg: "bg-warning/5" },
  info: { icon: Info, color: "border-l-primary", iconColor: "text-primary", bg: "bg-primary/5" },
};

const Notifications = () => {
  const { notifications, loading, refetch } = useDashboardData();

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true } as any).eq("id", id);
    refetch();
  };

  const criticalCount = notifications.filter((n) => n.severity === "critical" && !n.is_read).length;
  const warningCount = notifications.filter((n) => n.severity === "warning" && !n.is_read).length;
  const infoCount = notifications.filter((n) => n.severity === "info" && !n.is_read).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on your food freshness alerts</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <span className="text-2xl font-bold text-foreground">{criticalCount}</span>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <span className="text-2xl font-bold text-foreground">{warningCount}</span>
                <div className="text-xs text-muted-foreground">Warning</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4 flex items-center gap-3">
              <Info className="h-5 w-5 text-primary" />
              <div>
                <span className="text-2xl font-bold text-foreground">{infoCount}</span>
                <div className="text-xs text-muted-foreground">Info</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification list */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-semibold text-foreground">You're all caught up!</p>
              <p className="text-sm text-muted-foreground">No more notifications at the moment. We'll alert you when something needs attention.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const sc = severityConfig[notif.severity];
              const Icon = sc.icon;
              const timeSince = getTimeSince(notif.created_at);
              return (
                <Card
                  key={notif.id}
                  className={`border-l-4 ${sc.color} ${!notif.is_read ? sc.bg : "opacity-60"} cursor-pointer transition-opacity`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      <Icon className={`h-5 w-5 ${sc.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${sc.iconColor}`}>{notif.title}</div>
                      <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeSince}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
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
  return `${days}d+ ago`;
}

export default Notifications;
