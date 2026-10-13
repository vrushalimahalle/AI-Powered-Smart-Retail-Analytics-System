/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Cpu, Send, Bot, User, Sparkles, RefreshCcw, HelpCircle, FileText, CheckCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatbotProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export default function AIChatbot({ chatHistory, onSendMessage, isLoading }: AIChatbotProps) {
  const [userInput, setUserInput] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    setUserInput('');
    await onSendMessage(textToSend);
  };

  const presetPrompts = [
    { label: "What are total sales?", query: "What are total sales and profit metrics?" },
    { label: "Which category has max profit?", query: "Which category generated maximum profit?" },
    { label: "Show top products", query: "Show top five products and gross sales." },
    { label: "Explain segments", query: "Explain customer segments and averages." },
    { label: "Predict sales", query: "Predict future sales and show XGBoost evaluation." }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  return (
    <div className="space-y-6 animate-fade-in" id="chatbot-view">
      
      {/* Rapid Action Preset Prompts Box */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" /> Rapid Grounded Analytical Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {presetPrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(p.query)}
              className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer transition active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Workspace Layout */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl shadow-xl flex flex-col h-[520px] overflow-hidden">
        
        {/* Chatbot Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Intelligent RAG Decision Support</h3>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Grounded on active retail database
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Secure LLM Engine</span>
        </div>

        {/* Message listings panel */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900/10">
          
          {chatHistory.map((msg) => {
            const isAI = msg.sender === 'assistant';
            return (
              <div key={msg.id} className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 self-start">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2.5 max-w-[85%] rounded-2xl p-4 shadow-md ${isAI ? 'bg-slate-800/60 border border-slate-800 text-slate-200' : 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/15'}`}>
                  {/* Text markdown block */}
                  <div className="text-sm leading-relaxed whitespace-pre-line font-sans">
                    {msg.text}
                  </div>

                  {/* Grounded data metadata visualization overlay */}
                  {isAI && msg.insightsData && Object.keys(msg.insightsData).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 space-y-1 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 font-mono">
                      <p className="font-bold text-blue-400 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Retrieved RAG Database Context:
                      </p>
                      {msg.insightsData.financialTotals && <p>• Financial Aggregates (Gross sales, net profit, margin yield)</p>}
                      {msg.insightsData.categoryPerformance && <p>• Product Categories Performance (Yield shares, max profits)</p>}
                      {msg.insightsData.topProductsList && <p>• Product Popularity Ranks (Sales, quantities, SKUs)</p>}
                      {msg.insightsData.customerSegments && <p>• RFM Clustering Centroids (Premium, Regular, Budget counts)</p>}
                      {msg.insightsData.forecastingEvaluation && <p>• Predictive Machine Learning Models (XGBoost, RandomForest validations)</p>}
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-500 flex items-center justify-center text-white shrink-0 self-start font-bold text-xs uppercase">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 self-start animate-spin">
                <RefreshCcw className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/60 border border-slate-800 text-slate-400 text-xs font-mono p-3 rounded-2xl flex items-center gap-2">
                Scanning database partitions and generating insights...
              </div>
            </div>
          )}

          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2">
              <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
              <p className="text-xs">Ask anything about the retail analytics platform or select a prompt preset above</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Text Box Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex gap-2">
          <input
            type="text"
            placeholder="Type your retail analytics query..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(userInput)}
            className="flex-1 bg-slate-900/40 border border-slate-700/80 rounded-xl py-2.5 px-4 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
          <button
            disabled={isLoading || !userInput.trim()}
            onClick={() => handleSend(userInput)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition active:scale-95 text-white font-bold rounded-xl inline-flex items-center justify-center cursor-pointer shrink-0 shadow-lg shadow-blue-500/15"
            id="btn-send-message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
