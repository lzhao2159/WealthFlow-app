import React, { useState } from 'react';
import { AppState, Stock } from '../types';
import { RefreshCw, Plus, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { getMarketSentiment } from '../services/geminiService';

interface StocksProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

export const Stocks: React.FC<StocksProps> = ({ state, updateState }) => {
  const [loading, setLoading] = useState(false);
  const [sentiment, setSentiment] = useState<{id: string, text: string} | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  // Simulation of "Updating from Exchange"
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const updatedStocks = state.stocks.map(stock => {
        // Random fluctuation between -2% and +2%
        const change = (Math.random() * 0.04) - 0.02; 
        return {
          ...stock,
          currentPrice: Number((stock.currentPrice * (1 + change)).toFixed(2))
        };
      });
      updateState({ stocks: updatedStocks });
      setLoading(false);
    }, 1000);
  };

  const handleAnalyze = async (stock: Stock) => {
    setAnalyzing(stock.id);
    const analysis = await getMarketSentiment(stock.symbol);
    setSentiment({ id: stock.id, text: analysis });
    setAnalyzing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">股市投資組合</h2>
           <p className="text-slate-500 text-sm">即時監控台股與美股資產</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             <span>更新報價</span>
           </button>
           <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
             <Plus size={18} />
             <span>新增持股</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {state.stocks.map(stock => {
          const marketValue = stock.quantity * stock.currentPrice;
          const costBasis = stock.quantity * stock.avgPrice;
          const profit = marketValue - costBasis;
          const profitPercent = (profit / costBasis) * 100;
          const isProfitable = profit >= 0;

          return (
            <div key={stock.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${stock.market === 'TW' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {stock.market}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{stock.symbol}</h3>
                    <p className="text-xs text-slate-500">{stock.name}</p>
                  </div>
                </div>
                <div className={`text-right ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <p className="text-lg font-bold flex items-center justify-end">
                    {isProfitable ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                    {profitPercent.toFixed(2)}%
                  </p>
                  <p className="text-xs opacity-75">{isProfitable ? '+' : ''}{profit.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                <div>
                  <p className="text-xs text-slate-400">持有股數</p>
                  <p className="font-medium">{stock.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">現價</p>
                  <p className="font-medium">${stock.currentPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">均價</p>
                  <p className="font-medium">${stock.avgPrice}</p>
                </div>
                <div>
                   <p className="text-xs text-slate-400">市值</p>
                   <p className="font-bold text-slate-800">${marketValue.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50">
                {sentiment?.id === stock.id ? (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 animate-fade-in">
                    <p className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                       <Search size={14} /> 市場分析
                    </p>
                    {sentiment.text}
                  </div>
                ) : (
                   <button 
                    onClick={() => handleAnalyze(stock)}
                    disabled={analyzing === stock.id}
                    className="w-full py-2 text-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                   >
                     {analyzing === stock.id ? (
                       <RefreshCw size={14} className="animate-spin" />
                     ) : (
                       <Search size={14} />
                     )}
                     <span>AI 智能分析</span>
                   </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
