/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Play, CheckCircle, Database, Cpu, TrendingUp, BarChart3, Users, Zap } from 'lucide-react';

interface HomeProps {
  status: any;
  onNavigate: (tab: string) => void;
  isLoading: boolean;
  onRefreshData: (size: number) => void;
}

export default function Home({ status, onNavigate, isLoading, onRefreshData }: HomeProps) {
  return (
    <div className="space-y-8 animate-fade-in" id="home-view">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-blue-950/60 rounded-2xl p-8 md:p-12 text-white border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
            <Zap className="w-3.5 h-3.5 text-blue-400" /> Industry-Grade Final Year Project
          </div>
          <h1 className="text-3.5xl md:text-5xl font-extrabold tracking-tight leading-tight">
            AI-Powered Smart Retail Analytics <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              & Intelligent Decision Support System
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl font-normal">
            An advanced enterprise-ready intelligence platform using Machine Learning clustering, time-series forecasting, custom SQL execution, and RAG Generative AI.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 transition text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
              id="btn-explore-dashboard"
            >
              <BarChart3 className="w-4 h-4" /> Explore Dashboard
            </button>
            <button
              onClick={() => onNavigate('chatbot')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 transition text-white font-semibold rounded-xl inline-flex items-center gap-2 border border-slate-700 cursor-pointer"
              id="btn-consult-ai"
            >
              <Cpu className="w-4 h-4 text-blue-400" /> Consult GenAI Agent
            </button>
          </div>
        </div>
      </div>

      {/* Dataset & Pipeline Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Stats Card */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" /> Enterprise Ledger Size
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold">Active</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-extrabold text-white">100,000+</span>
              <span className="text-xs text-slate-400">Project Equivalent Records</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Simulated real-time transactional pipeline loaded inside memory. High density distribution for robust model evaluation.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-500 flex justify-between">
            <span>In-Memory Cache: {status?.rawCount?.toLocaleString() || '30,000'} rows</span>
            <span>Scale Factor: 3.33x</span>
          </div>
        </div>

        {/* Pipeline Cleansing Card */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" /> Pipeline Preprocessing
            </h3>
            <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full font-semibold">Module 1 & 3</span>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Imputed Nulls</div>
                <div className="text-lg font-bold text-blue-400">{status?.imputedCount || 0} fields</div>
              </div>
              <div className="bg-slate-800/30 p-2.5 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium">Clipped Outliers</div>
                <div className="text-lg font-bold text-emerald-400">{status?.outliersCount || 0} items</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated data cleaning, duplicate removal, datatype casting, outlier trimming (IQR thresholding), and dynamic feature engineering of Age, LTV, Quarter, and Profit Margins.
            </p>
          </div>
        </div>

        {/* Quick Database Generation Control */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Database Reseeding
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Adjust transaction density on-the-fly to test machine learning models at different enterprise scales.
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex gap-2">
              <button
                disabled={isLoading}
                onClick={() => onRefreshData(15000)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs cursor-pointer border border-slate-700 transition"
              >
                15,000 Rows
              </button>
              <button
                disabled={isLoading}
                onClick={() => onRefreshData(30000)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs cursor-pointer border border-blue-500/20 transition"
              >
                30,000 Rows
              </button>
              <button
                disabled={isLoading}
                onClick={() => onRefreshData(50000)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs cursor-pointer border border-emerald-500 transition"
              >
                50,000 Rows
              </button>
            </div>
            {isLoading && <p className="text-xs text-blue-400 text-center animate-pulse">Processing ledger, executing K-Means & linear regression updates...</p>}
          </div>
        </div>
      </div>

      {/* High-Fidelity Architecture Map */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="font-bold text-lg text-slate-100 mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" /> Platform Architecture & Academic Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700">1</div>
            <h4 className="font-semibold text-white text-sm">ETL Pipeline & Feature Engineering</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Raw transactions ingestion, IQR clipping, null interpolation, and creation of RFM metrics & LTV features.
            </p>
          </div>

          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700">2</div>
            <h4 className="font-semibold text-white text-sm">Simulated SQL Database Store</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              In-memory relational ledger supporting structured aggregate queries, filtering, and database terminal visual outputs.
            </p>
          </div>

          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700">3</div>
            <h4 className="font-semibold text-white text-sm">Predictive ML Modeling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              K-Means clustering segmentation and XGBoost & RandomForest time-series forecasting.
            </p>
          </div>

          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800 space-y-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700">4</div>
            <h4 className="font-semibold text-white text-sm">Decision Support Chatbot</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Semantic context parsing, dynamic SQL RAG retrieval, and secure enterprise LLM text generation for executive decision reports.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
