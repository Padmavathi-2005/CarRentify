"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Car,
  Calendar,
  CheckCircle2,
  XCircle,
  CreditCard,
  BarChart2,
  RefreshCw,
  Download,
  PieChart,
  Award,
} from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { analyticsService } from "@/services/analyticsService";
import { getImageUrl } from "@/config/api";

/* ─── Tiny Pure-CSS Bar Chart ──────────────────────────── */
function BarChart({
  data,
  dataKey,
  secondaryKey,
  label,
  secondaryLabel,
  color = "#6366f1",
  secondaryColor = "#10b981",
  formatValue = (v: number) => v.toString(),
}: {
  data: any[];
  dataKey: string;
  secondaryKey?: string;
  label: string;
  secondaryLabel?: string;
  color?: string;
  secondaryColor?: string;
  formatValue?: (v: number) => string;
}) {
  const allValues = data.flatMap((d) =>
    secondaryKey ? [d[dataKey], d[secondaryKey]] : [d[dataKey]]
  );
  const max = Math.max(...allValues, 1);

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} /> {label}
        </span>
        {secondaryKey && (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: secondaryColor }} /> {secondaryLabel}
          </span>
        )}
      </div>
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex items-end gap-0.5 h-32">
              <div
                className="flex-1 rounded-t-app transition-all duration-700 cursor-pointer relative"
                style={{ height: `${(d[dataKey] / max) * 100}%`, background: color, minHeight: "4px" }}
                title={`${d.month || d.method || d.status}: ${formatValue(d[dataKey])}`}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {formatValue(d[dataKey])}
                </div>
              </div>
              {secondaryKey && (
                <div
                  className="flex-1 rounded-t-app transition-all duration-700"
                  style={{ height: `${(d[secondaryKey] / max) * 100}%`, background: secondaryColor, minHeight: "4px" }}
                  title={`Commission: ${formatValue(d[secondaryKey])}`}
                />
              )}
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">
              {d.month || d.method || d.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tiny Donut Chart (CSS) ────────────────────────────── */
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="text-center text-slate-400 text-xs py-10">No data</div>;

  let cumulativeDeg = 0;
  const segments = data.map((d, i) => {
    const pct = (d.value / total) * 100;
    const deg = (pct / 100) * 360;
    const start = cumulativeDeg;
    cumulativeDeg += deg;
    return { ...d, pct, start, color: colors[i % colors.length] };
  });

  const gradientStops = segments
    .map((s) => `${s.color} ${s.start}deg ${s.start + ((s.value / total) * 360)}deg`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-32 h-32 rounded-full"
        style={{
          background: `conic-gradient(${gradientStops})`,
          mask: "radial-gradient(circle at center, transparent 45%, black 46%)",
          WebkitMask: "radial-gradient(circle at center, transparent 45%, black 46%)",
        }}
      />
      <div className="w-full space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{s.label}</span>
            </div>
            <span className="text-[10px] font-black text-slate-800 dark:text-slate-200">
              {s.value} <span className="text-slate-400">({s.pct.toFixed(0)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── KPI Stat Card ─────────────────────────────────────── */
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  border,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
  border: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-app border ${border} ${bg} p-5 flex flex-col gap-4 group hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="flex justify-between items-start">
        <div className={`w-11 h-11 rounded-app bg-white/60 dark:bg-white/5 border ${border} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
        {sub && <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ─── Main View ─────────────────────────────────────────── */
export default function AdminAnalysisView() {
  const { formatPrice } = useLocale();
  const [kpis, setKpis] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [topCars, setTopCars] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState(6);

  const fetchAll = async () => {
    try {
      const [k, r, s, tc, pm, ug] = await Promise.all([
        analyticsService.getSummaryKPIs(),
        analyticsService.getRevenueByMonth(period),
        analyticsService.getBookingStatusBreakdown(),
        analyticsService.getTopCars(5),
        analyticsService.getPaymentMethodBreakdown(),
        analyticsService.getUserGrowthByMonth(period),
      ]);
      if (k) setKpis(k);
      setRevenue(r || []);
      setStatusBreakdown(s || []);
      setTopCars(tc || []);
      setPaymentMethods(pm || []);
      setUserGrowth(ug || []);
    } catch (e) {
      console.error("Analytics fetch failed:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAll();
  };

  const statusColors = [
    "#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#64748b",
  ];

  const paymentColors = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Platform <span className="text-primary italic">Analysis</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Revenue, bookings, commission & user growth insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-app text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer focus:border-primary text-slate-700 dark:text-slate-200 transition-all"
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-11 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-app text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:border-primary hover:text-primary transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard icon={DollarSign} label="Total Revenue" value={formatPrice(kpis?.totalRevenue || 0)} color="text-emerald-500" bg="bg-emerald-500/5" border="border-emerald-500/10" delay={0} />
        <KpiCard icon={TrendingUp} label="Admin Commission" value={formatPrice(kpis?.totalCommission || 0)} sub="Platform earnings" color="text-violet-500" bg="bg-violet-500/5" border="border-violet-500/10" delay={0.05} />
        <KpiCard icon={Calendar} label="Total Bookings" value={(kpis?.totalBookings || 0).toString()} sub={`${kpis?.completionRate || 0}% completion rate`} color="text-blue-500" bg="bg-blue-500/5" border="border-blue-500/10" delay={0.1} />
        <KpiCard icon={Users} label="Total Users" value={(kpis?.totalUsers || 0).toString()} color="text-amber-500" bg="bg-amber-500/5" border="border-amber-500/10" delay={0.15} />
        <KpiCard icon={Car} label="Total Cars" value={(kpis?.totalCars || 0).toString()} color="text-rose-500" bg="bg-rose-500/5" border="border-rose-500/10" delay={0.2} />
      </div>

      {/* Booking completion vs cancellation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-app bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={22} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed Bookings</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{kpis?.completedBookings || 0}</h3>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">{kpis?.completionRate || 0}% completion rate</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-app bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <XCircle size={22} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cancelled Bookings</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{kpis?.cancelledBookings || 0}</h3>
            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">{kpis?.cancellationRate || 0}% cancellation rate</p>
          </div>
        </div>
      </div>

      {/* Revenue & Commission Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-app bg-primary/10 flex items-center justify-center">
            <BarChart2 size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Revenue vs Commission</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Monthly breakdown</p>
          </div>
        </div>
        {revenue.length > 0 ? (
          <BarChart
            data={revenue}
            dataKey="revenue"
            secondaryKey="commission"
            label="Revenue"
            secondaryLabel="Commission"
            color="#6366f1"
            secondaryColor="#10b981"
            formatValue={(v) => formatPrice(v)}
          />
        ) : (
          <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No revenue data yet</div>
        )}
      </div>

      {/* User Growth Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-app bg-blue-500/10 flex items-center justify-center">
            <Users size={18} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">User Growth</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">New registrations per month</p>
          </div>
        </div>
        {userGrowth.length > 0 ? (
          <BarChart
            data={userGrowth}
            dataKey="users"
            label="New Users"
            color="#3b82f6"
            formatValue={(v) => `${v} users`}
          />
        ) : (
          <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">No user growth data yet</div>
        )}
      </div>

      {/* Bottom Row: Status Donut + Payment Methods + Top Cars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Status Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-app bg-amber-500/10 flex items-center justify-center">
              <PieChart size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Booking Status</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Distribution</p>
            </div>
          </div>
          <DonutChart
            data={statusBreakdown.map((s) => ({ label: s.status, value: s.count }))}
            colors={statusColors}
          />
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-app bg-violet-500/10 flex items-center justify-center">
              <CreditCard size={18} className="text-violet-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Payment Methods</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Usage breakdown</p>
            </div>
          </div>
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {(() => {
                const total = paymentMethods.reduce((s, p) => s + p.count, 0);
                return paymentMethods.map((p, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{p.method}</span>
                      <span className="text-[10px] font-black text-slate-500">{p.count} · {formatPrice(p.revenue)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(p.count / total) * 100}%`, background: paymentColors[i % paymentColors.length] }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No payment data yet</div>
          )}
        </div>

        {/* Top Cars */}
        <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-app bg-rose-500/10 flex items-center justify-center">
              <Award size={18} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Top Cars</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">By bookings</p>
            </div>
          </div>
          {topCars.length > 0 ? (
            <div className="space-y-3">
              {topCars.map((car, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 w-4 shrink-0">#{i + 1}</span>
                  {car.image ? (
                    <img
                      src={getImageUrl(car.image)}
                      alt={car.name}
                      className="w-10 h-8 object-cover rounded-app bg-slate-100 dark:bg-slate-800 shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-10 h-8 rounded-app bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Car size={14} className="text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{car.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{car.bookings} bookings · {formatPrice(car.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No car data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
