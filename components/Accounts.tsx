import React, { useState } from 'react';
import { BankAccount, AppState } from '../types';
import { Plus, Trash2, CreditCard } from 'lucide-react';

interface AccountsProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

export const Accounts: React.FC<AccountsProps> = ({ state, updateState }) => {
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    name: '',
    bankName: '',
    type: 'Checking',
    balance: 0,
    currency: 'TWD'
  });

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.bankName) return;
    
    const account: BankAccount = {
      id: Date.now().toString(),
      name: newAccount.name!,
      bankName: newAccount.bankName!,
      type: newAccount.type as any,
      balance: Number(newAccount.balance) || 0,
      currency: newAccount.currency || 'TWD',
      color: 'bg-slate-800' // Simplified color selection
    };

    updateState({
      accounts: [...state.accounts, account]
    });
    setShowModal(false);
    setNewAccount({ name: '', bankName: '', type: 'Checking', balance: 0, currency: 'TWD' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此帳戶嗎？所有相關紀錄將被保留，但帳戶將無法存取。')) {
      updateState({
        accounts: state.accounts.filter(a => a.id !== id)
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">帳戶管理</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={18} />
          <span>新增帳戶</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.accounts.map(acc => (
          <div key={acc.id} className="relative group overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleDelete(acc.id)}
                className="p-2 bg-white/10 hover:bg-rose-500 rounded-full text-white backdrop-blur-sm transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-slate-400 text-sm font-medium">{acc.bankName}</p>
                <h3 className="text-xl font-bold mt-1">{acc.name}</h3>
              </div>
              <CreditCard className="text-slate-400" size={24} />
            </div>

            <div className="flex justify-between items-end">
               <div>
                 <p className="text-xs text-slate-400 mb-1">當前餘額</p>
                 <p className="text-2xl font-mono tracking-wider">${acc.balance.toLocaleString()}</p>
               </div>
               <div className="text-xs px-2 py-1 bg-white/10 rounded">
                 {acc.currency}
               </div>
            </div>
          </div>
        ))}

        {/* Empty State Add Button */}
        {state.accounts.length === 0 && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all h-48"
          >
            <Plus size={32} className="mb-2" />
            <span className="font-medium">新增第一個帳戶</span>
          </button>
        )}
      </div>

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-4">新增銀行帳戶</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">銀行名稱</label>
                <input 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newAccount.bankName}
                  onChange={e => setNewAccount({...newAccount, bankName: e.target.value})}
                  placeholder="例如：中國信託"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">帳戶暱稱</label>
                <input 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="例如：薪轉戶"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">初始餘額</label>
                   <input 
                    type="number"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newAccount.balance}
                    onChange={e => setNewAccount({...newAccount, balance: Number(e.target.value)})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">幣別</label>
                   <select 
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={newAccount.currency}
                    onChange={e => setNewAccount({...newAccount, currency: e.target.value})}
                  >
                    <option value="TWD">TWD</option>
                    <option value="USD">USD</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleAddAccount}
                className="flex-1 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg"
              >
                建立帳戶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
