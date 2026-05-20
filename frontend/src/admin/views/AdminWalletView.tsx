"use client";

import React, { useEffect, useState } from "react";
import { 
  Wallet, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  DollarSign, 
  RefreshCw,
  Download,
  FileText,
  BadgeAlert
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/LocaleContext";
import { walletService } from "@/services/walletService";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminWalletView() {
  const { formatPrice } = useLocale();
  const [balanceData, setBalanceData] = useState({ balance: 0, currency: "USD" });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, credit, debit
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWalletData = async () => {
    try {
      const [bal, txs] = await Promise.all([
        walletService.getAdminBalance(),
        walletService.getAdminTransactions()
      ]);
      if (bal) setBalanceData(bal);
      if (txs) setTransactions(txs);
    } catch (err) {
      console.error("Error fetching admin wallet data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWalletData();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("No transaction data available for export.");
      return;
    }
    
    const headers = ["Transaction ID", "Type", "Amount", "Source", "Description", "Date"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => 
        `"${t._id}","${t.type}","${t.amount}","${t.source}","${t.description.replace(/"/g, '""')}","${new Date(t.createdAt).toLocaleString()}"`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `admin_wallet_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      (t.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.referenceId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t._id || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === "all" || 
      t.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Calculate high-level financial stats
  const totalCommission = transactions
    .filter(t => t.type === 'credit' && t.source === 'booking')
    .reduce((sum, t) => sum + t.amount, 0);

  const averageCommission = transactions.length > 0 && transactions.filter(t => t.source === 'booking').length > 0
    ? totalCommission / transactions.filter(t => t.source === 'booking').length
    : 0;

  const totalAdjustments = transactions
    .filter(t => t.source === 'admin')
    .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Admin <span className="text-primary italic">Wallet</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Overview of collected commission funds and admin ledger
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="h-11 px-4 rounded-app border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh Ledger</span>
          </Button>

          <Button 
            onClick={handleExportCSV}
            className="h-11 px-4 rounded-app bg-primary hover:bg-primary-hover text-white transition-all flex items-center gap-2"
          >
            <Download size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-app border-none bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 rounded-app bg-white/5 flex items-center justify-center border border-white/10">
                <Wallet size={20} className="text-primary" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full">
                Active Ledger
              </span>
            </div>
            
            <div className="relative z-10">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Admin Balance
              </p>
              <h3 className="text-3xl font-black tracking-tight mb-2">
                {formatPrice(balanceData.balance)}
              </h3>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Currency: {balanceData.currency}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Total Commission Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="rounded-app border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-app bg-emerald-500/5 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                <TrendingUp size={20} className="text-emerald-500" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                Revenue
              </span>
            </div>
            
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Commissions Collected
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {formatPrice(totalCommission)}
              </h3>
              <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Average commission: {formatPrice(averageCommission)}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Adjustments Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="rounded-app border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-app bg-blue-500/5 dark:bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                <ArrowUpRight size={20} className="text-blue-500" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 px-2.5 py-1 rounded-full">
                Ledger Operations
              </span>
            </div>
            
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Net Manual Adjustments
              </p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {totalAdjustments >= 0 ? "+" : ""}{formatPrice(totalAdjustments)}
              </h3>
              <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Total ledger size: {transactions.length} items
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Transaction Details Ledger Section */}
      <div className="bg-white dark:bg-slate-900 rounded-app border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header Search & Filtering */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Ledger & Transaction Logs
          </h3>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search ledger logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-9 pr-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-app text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary transition-all w-full placeholder:opacity-50"
              />
            </div>
            {/* Filter Dropdown */}
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 w-full md:w-40 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-app text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer focus:border-primary text-slate-700 dark:text-slate-200 transition-all"
            >
              <option value="all">All Logs</option>
              <option value="credit">Credits (Income)</option>
              <option value="debit">Debits (Expense)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Logs / Ref</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText className="mx-auto text-slate-200 dark:text-slate-800 mb-3" size={40} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No ledger transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight">
                          Ref: #{tx.referenceId ? tx.referenceId.slice(-8).toUpperCase() : tx._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                          {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md">
                      <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 leading-normal">
                        {tx.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {tx.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-black ${
                        tx.type === 'credit' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'credit' ? "+" : "-"}{formatPrice(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        tx.type === 'credit' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20' 
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100/50 dark:border-rose-500/20'
                      }`}>
                        {tx.type === 'credit' ? (
                          <>
                            <ArrowUpRight size={10} />
                            CREDIT
                          </>
                        ) : (
                          <>
                            <ArrowDownRight size={10} />
                            DEBIT
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
