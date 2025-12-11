import React, { useState } from 'react';
import { AppState, Transaction, TransactionType } from '../types';
import { Plus, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface TransactionsProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ state, updateState }) => {
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [showAdd, setShowAdd] = useState(false);
  
  // New Transaction State
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id || '');
  const [note, setNote] = useState('');

  const filteredTransactions = state.transactions.filter(t => 
    filterType === 'ALL' ? true : t.type === filterType
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddTransaction = () => {
    if (amount <= 0 || !category || !accountId) return;

    const newTrans: Transaction = {
      id: Date.now().toString(),
      accountId,
      date: new Date().toISOString(),
      amount,
      type,
      category,
      note
    };

    // Update account balance
    const updatedAccounts = state.accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          balance: type === TransactionType.INCOME 
            ? acc.balance + amount 
            : acc.balance - amount
        };
      }
      return acc;
    });

    updateState({
      transactions: [newTrans, ...state.transactions],
      accounts: updatedAccounts
    });

    setShowAdd(false);
    setAmount(0);
    setCategory('');
    setNote('');
  };

  const categories = type === TransactionType.EXPENSE 
    ? ['飲食', '交通', '居住', '娛樂', '醫療', '購物', '其他']
    : ['薪資', '投資', '獎金', '還款', '其他'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">收支紀錄</h2>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
             <button 
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-sm rounded-md transition-all ${filterType === 'ALL' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
             >全部</button>
             <button 
              onClick={() => setFilterType(TransactionType.INCOME)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${filterType === TransactionType.INCOME ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
             >收入</button>
             <button 
              onClick={() => setFilterType(TransactionType.EXPENSE)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${filterType === TransactionType.EXPENSE ? 'bg-white shadow text-rose-600' : 'text-slate-500'}`}
             >支出</button>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">記一筆</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">日期</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">類別</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">帳戶</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">備註</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">金額</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(t => {
              const account = state.accounts.find(a => a.id === t.accountId);
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{account?.name || '未知帳戶'}</td>
                  <td className="p-4 text-sm text-slate-500 max-w-xs truncate">{t.note || '-'}</td>
                  <td className={`p-4 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Filter size={32} className="mb-2 opacity-50" />
            <p>沒有符合條件的紀錄</p>
          </div>
        )}
      </div>

      {/* Add Transaction Drawer/Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">新增交易</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setType(TransactionType.EXPENSE)}
                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 ${type === TransactionType.EXPENSE ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-400'}`}
              >
                <ArrowDownLeft size={20} /> 支出
              </button>
              <button 
                onClick={() => setType(TransactionType.INCOME)}
                className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 ${type === TransactionType.INCOME ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-200 text-slate-400'}`}
              >
                <ArrowUpRight size={20} /> 收入
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">金額</label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                   <input 
                    type="number" 
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分類</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-2 text-sm rounded-lg border ${category === cat ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳戶</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                >
                  <option value="" disabled>選擇帳戶</option>
                  {state.accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.bankName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">備註</label>
                <textarea 
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="寫點什麼..."
                />
              </div>
            </div>

            <button 
              onClick={handleAddTransaction}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors mt-4"
            >
              確認儲存
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
