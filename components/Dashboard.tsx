import React, { useMemo } from 'react';
import { AppState, TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { totalBalance, stockValue, netWorth } = useMemo(() => {
    const balance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const stocks = state.stocks.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
    return {
      totalBalance: balance,
      stockValue: stocks,
      netWorth: balance + stocks
    };
  }, [state]);

  const expenseByCategory = useMemo(() => {
    const expenses = state.transactions.filter(t => t.type === TransactionType.EXPENSE);
    const map = new Map<string, number>();
    expenses.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [state.transactions]);

  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">總覽儀表板</h2>
        <p className="text-slate-500">歡迎回來，{state.user?.name}。這是您的財務快照。</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">總資產淨值</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">${netWorth.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-emerald-600">
            <TrendingUp size={16} className="mr-1" />
            <span>資產穩健增長中</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">現金結餘</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">${totalBalance.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">分佈於 {state.accounts.length} 個帳戶</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">證券市值</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">${stockValue.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">持有 {state.stocks.length} 支股票</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">本月支出</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">
                ${state.transactions
                  .filter(t => t.type === TransactionType.EXPENSE && new Date(t.date).getMonth() === new Date().getMonth())
                  .reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
              <TrendingDown size={20} />
            </div>
          </div>
           <p className="mt-4 text-sm text-slate-400">請注意預算控制</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">支出分類分析</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-4">近期收支紀錄</h3>
           <div className="space-y-4">
             {recentTransactions.map(t => (
               <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0">
                 <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                     t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                   }`}>
                     {t.type === TransactionType.INCOME ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                   </div>
                   <div>
                     <p className="font-medium text-slate-800">{t.category}</p>
                     <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <span className={`font-bold ${
                   t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'
                 }`}>
                   {t.type === TransactionType.EXPENSE ? '-' : '+'}${t.amount.toLocaleString()}
                 </span>
               </div>
             ))}
             {recentTransactions.length === 0 && <p className="text-center text-slate-400 py-4">暫無紀錄</p>}
           </div>
        </div>
      </div>
    </div>
  );
};
