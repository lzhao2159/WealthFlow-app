import { GoogleGenAI } from "@google/genai";
import { AppState, TransactionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  state: AppState,
  userQuery: string
): Promise<string> => {
  // Construct a context-aware prompt based on user's data
  const totalBalance = state.accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const totalStockValue = state.stocks.reduce((acc, curr) => acc + (curr.quantity * curr.currentPrice), 0);
  
  const income = state.transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const expense = state.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const dataContext = `
    【財務概況】
    - 總資產(現金+股票): TWD ${totalBalance + totalStockValue}
    - 現金餘額: TWD ${totalBalance}
    - 股票市值: TWD ${totalStockValue}
    - 歷史總收入: TWD ${income}
    - 歷史總支出: TWD ${expense}
    
    【持股狀況】
    ${state.stocks.map(s => `- ${s.name} (${s.symbol}): 持有 ${s.quantity} 股, 現價 ${s.currentPrice}`).join('\n')}
    
    【使用者問題】
    ${userQuery}
  `;

  const systemInstruction = `你是「WealthFlow Pro」的智能財務顧問。請根據使用者的財務數據回答問題。
請用繁體中文回答，語氣專業且鼓勵人心。針對投資建議請給予客觀分析，並提醒投資風險。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: dataContext,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "抱歉，我現在無法分析您的數據。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "連線發生錯誤，請稍後再試。";
  }
};

export const getMarketSentiment = async (stockSymbol: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請簡短分析股票代號 ${stockSymbol} 的近期市場情緒與關鍵新聞趨勢（假設你是專業分析師）。請用繁體中文回答，限制在 100 字以內。`,
      config: {
        tools: [{ googleSearch: {} }] // Use grounding for up-to-date info
      }
    });
    
    let text = response.text || "暫無數據";

    // Extract grounding URLs if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const sources = groundingChunks
        .map((chunk: any) => chunk.web?.uri)
        .filter((uri: string) => typeof uri === 'string')
        .map((uri: string, index: number) => `[${index + 1}] ${uri}`)
        .join('\n');
      
      if (sources) {
        text += `\n\n參考來源:\n${sources}`;
      }
    }

    return text;
  } catch (error) {
    console.error("Market Sentiment Error:", error);
    return "無法取得市場分析";
  }
}