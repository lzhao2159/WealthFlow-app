
import React, { useState, useEffect } from 'react';
import { AppState, ViewState, TransactionType } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Accounts } from './components/Accounts';
import { Transactions } from './components/Transactions';
import { Stocks } from './components/Stocks';
import { AIAdvisor } from './components/AIAdvisor';
import { Menu, Loader2 } from 'lucide-react';
import { auth, initializeUserData, saveStateToFirebase } from './services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const INITIAL_STATE: AppState = {
  user: null,
  accounts: [],
  transactions: [],
  stocks: []
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 監聽登入狀態並載入資料
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // 從 Firestore 載入資料
          const data = await initializeUserData(currentUser.uid, currentUser.email || '');
          setAppState(data);
        } catch (error) {
          console.error("Failed to load user data", error);
        }
      } else {
        setAppState(INITIAL_STATE);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 更新狀態並同步到 Firebase
  const updateState = (newState: Partial<AppState>) => {
    setAppState(prev => {
      const updated = { ...prev, ...newState };
      // 觸發非同步儲存，不等待
      if (user) {
        saveStateToFirebase(user.uid, newState);
      }
      return updated;
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') setErrorMsg('帳號或密碼錯誤');
      else if (err.code === 'auth/email-already-in-use') setErrorMsg('此 Email 已被註冊');
      else if (err.code === 'auth/weak-password') setErrorMsg('密碼強度不足');
      else setErrorMsg('發生錯誤，請稍後再試');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('DASHBOARD');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">WealthFlow Pro</h1>
            <p className="text-slate-500">個人化智能財務管理系統</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
               <input 
                 type="email" 
                 required
                 className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                 placeholder="name@example.com"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">密碼</label>
               <input 
                 type="password" 
                 required
                 minLength={6}
                 className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                 placeholder="••••••••"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
             </div>
             
             {errorMsg && <p className="text-rose-500 text-sm text-center">{errorMsg}</p>}

             <button 
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg"
             >
               {isRegistering ? '註冊帳號' : '登入系統'}
             </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); }}
              className="text-sm text-slate-600 hover:text-emerald-600 font-medium"
            >
              {isRegistering ? '已有帳號？返回登入' : '還沒有帳號？立即註冊'}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            資料將安全儲存於 Firebase 雲端資料庫。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h1 className="font-bold text-lg text-slate-800">WealthFlow</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {view === 'DASHBOARD' && <Dashboard state={appState} />}
            {view === 'ACCOUNTS' && <Accounts state={appState} updateState={updateState} />}
            {view === 'TRANSACTIONS' && <Transactions state={appState} updateState={updateState} />}
            {view === 'STOCKS' && <Stocks state={appState} updateState={updateState} />}
            {view === 'ADVISOR' && <AIAdvisor state={appState} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
