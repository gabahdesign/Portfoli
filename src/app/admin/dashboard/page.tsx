import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Eye, Users, Briefcase, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { ActivityChart } from "@/components/admin/ActivityChart";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 30 days ago calculation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysStr = thirtyDaysAgo.toISOString();

  // Fetch all data in parallel
  const [
    { count: totalEvents },
    { count: totalWorks },
    { count: totalCompanies },
    { count: totalTokens },
    { data: recentEvents },
    { data: topWorks },
    { data: last30DaysActivity },
  ] = await Promise.all([
    supabase.from("analytics_events").select("*", { count: "exact", head: true }),
    supabase.from("works").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase.from("access_tokens").select("*", { count: "exact", head: true }),
    supabase
      .from("analytics_events")
      .select("id, event_type, duration_sec, scroll_pct, created_at, access_tokens(token, companies(name))")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("analytics_events")
      .select("work_id, works(title)")
      .not("work_id", "is", null)
      .limit(100),
    supabase
      .from("analytics_events")
      .select("created_at")
      .gte("created_at", thirtyDaysStr),
  ]);

  // Generate 30 days chart data
  const activityMap = new Map<string, number>();
  
  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("ca-ES", { day: "2-digit", month: "short" });
    activityMap.set(key, 0);
  }

  // Populate data
  (last30DaysActivity || []).forEach((event) => {
    const d = new Date(event.created_at);
    const key = d.toLocaleDateString("ca-ES", { day: "2-digit", month: "short" });
    if (activityMap.has(key)) {
      activityMap.set(key, activityMap.get(key)! + 1);
    }
  });

  const chartData = Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }));

  // Aggregate work views
  const workViewCounts: Record<string, { title: string; count: number }> = {};
  (topWorks ?? []).forEach((e: any) => {
    if (!e.work_id) return;
    const title = e.works?.title ?? e.work_id;
    if (!workViewCounts[e.work_id]) workViewCounts[e.work_id] = { title, count: 0 };
    workViewCounts[e.work_id].count++;
  });
  const sortedWorks = Object.entries(workViewCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  // Average read duration
  const avgDuration = recentEvents?.length
    ? Math.round(
        (recentEvents.reduce((sum: number, e: any) => sum + (e.duration_sec ?? 0), 0) /
          recentEvents.length) as number
      )
    : 0;

  const stats = [
    { label: "Pàgines Vistes", value: totalEvents ?? 0, icon: Eye, accent: false },
    { label: "Enllaços d'Accés", value: totalTokens ?? 0, icon: Users, accent: false },
    { label: "Treballs Publicats", value: totalWorks ?? 0, icon: Briefcase, accent: false },
    { label: "Empreses", value: totalCompanies ?? 0, icon: TrendingUp, accent: true },
  ];

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 w-full mx-auto">
      {/* Header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2 tracking-tight">Panel de Control</h1>
        <p className="text-[var(--color-muted)]">Vista general de l'activitat i rendiment del portfolio.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-[var(--color-surface)] border rounded-2xl p-6 flex flex-col gap-3 transition-all hover:scale-[1.02] ${
              stat.accent ? "border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/10" : "border-[var(--color-border)]"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.accent ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]" : "bg-[var(--color-bg)] text-[var(--color-muted)]"}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-3xl font-black text-[var(--color-text)] tracking-tight">{stat.value}</p>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-widest font-bold mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Activity Chart */}
      <div className="mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-[var(--color-text)] text-lg">Visites Últims 30 Dies</h2>
        </div>
        <ActivityChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-[var(--color-text)] text-lg">Activitat Recent</h2>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <Clock className="w-3.5 h-3.5" />
              Temps mitjà: <span className="font-bold text-[var(--color-text)]">{avgDuration}s</span>
            </div>
          </div>
          {!recentEvents?.length ? (
            <p className="text-[var(--color-muted)] text-sm text-center py-8">Encara no hi ha visites registrades.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((ev: any) => {
                const company = ev.access_tokens?.companies?.name ?? "Visitant Directe";
                const date = new Date(ev.created_at).toLocaleDateString("ca-ES", { day: "2-digit", month: "short" });
                const time = new Date(ev.created_at).toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={ev.id} className="flex items-center justify-between py-2.5 border-b border-[var(--color-border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                        {company.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate max-w-[150px] sm:max-w-xs">{company}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted)] mt-0.5">{ev.event_type === "page_view" ? "Vista general" : "Lectura projecte"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--color-muted)]">{date} · {time}</p>
                      {ev.duration_sec != null && (
                        <p className="text-xs font-medium text-[var(--color-accent)] mt-0.5">{ev.duration_sec}s · {ev.scroll_pct ?? 0}% scroll</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Works */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-[var(--color-text)] text-lg">Projectes Més Vistos</h2>
            <Link href="/admin/trabajos" className="text-xs font-bold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-1 transition-colors uppercase tracking-wider">
              Veure tots <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!sortedWorks.length ? (
            <p className="text-[var(--color-muted)] text-sm text-center py-8">Encara no hi ha dades específiques de projectes.</p>
          ) : (
            <div className="space-y-4">
              {sortedWorks.map(([id, { title, count }], i) => {
                const max = sortedWorks[0][1].count;
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={id}>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm font-semibold text-[var(--color-text)] truncate pr-4">{title}</span>
                      <span className="text-[11px] font-bold text-[var(--color-muted)] shrink-0 bg-[var(--color-bg)] border border-[var(--color-border)] px-2 py-0.5 rounded-full">{count} vista{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full bg-[var(--color-bg)] rounded-full h-2 border border-[var(--color-border)]/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)]/50 to-[var(--color-accent)] transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
