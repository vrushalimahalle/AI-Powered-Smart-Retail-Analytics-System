/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Home as HomeIcon, BarChart3, LineChart, Users, Bot, Database, Printer, Cpu, ChevronRight, ChevronLeft, Menu, RefreshCw, Layers } from 'lucide-react';

import Home from './components/Home';
import Dashboard from './components/Dashboard';
import SalesForecast from './components/SalesForecast';
import Segmentation from './components/Segmentation';
import AIChatbot from './components/AIChatbot';
import DatabaseTerminal from './components/DatabaseTerminal';
import Reports from './components/Reports';

import { KPIStats, ChartDataPoint, ForecastPoint, ForecastMetrics, SegmentInfo, ClusterCentroid, SQLResult, ChatMessage } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Core system database states
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [kpiStats, setKpiStats] = useState<KPIStats | null>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [trainMetricsRF, setTrainMetricsRF] = useState<ForecastMetrics>({ mae: 0, rmse: 0, r2: 0 });
  const [trainMetricsXGB, setTrainMetricsXGB] = useState<ForecastMetrics>({ mae: 0, rmse: 0, r2: 0 });
  const [futureForecast, setFutureForecast] = useState<any[]>([]);
  const [centroids, setCentroids] = useState<ClusterCentroid[]>([]);
  const [sampleSegments, setSampleSegments] = useState<SegmentInfo[]>([]);
  const [segmentMetrics, setSegmentMetrics] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Loading states
  const [isDbLoading, setIsDbLoading] = useState<boolean>(false);
  const [isChartsLoading, setIsChartsLoading] = useState<boolean>(false);
  const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
  const [isSegmentationLoading, setIsSegmentationLoading] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Initialize and load default system metrics
  useEffect(() => {
    fetchSystemStatus();
    loadDashboardData();
    loadForecastingMetrics();
    loadSegmentationMetrics(3); // Default K=3
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/data/status');
      const data = await response.json();
      if (data.success) {
        setDbStatus(data);
      }
    } catch (err) {
      console.error('Failed to load system status: ', err);
    }
  };

  const loadDashboardData = async () => {
    setIsChartsLoading(true);
    try {
      const [kpiRes, chartsRes] = await Promise.all([
        fetch('/api/data/kpis'),
        fetch('/api/data/charts')
      ]);
      const kpiData = await kpiRes.json();
      const chartsData = await chartsRes.json();

      if (kpiData.success) setKpiStats(kpiData.kpis);
      if (chartsData.success) setChartsData(chartsData);
    } catch (err) {
      console.error('Failed to load dashboard statistics: ', err);
    } finally {
      setIsChartsLoading(false);
    }
  };

  const loadForecastingMetrics = async () => {
    setIsForecastLoading(true);
    try {
      const res = await fetch('/api/forecasting');
      const data = await res.json();
      if (data.success) {
        setForecastData(data.forecastData);
        setTrainMetricsRF(data.trainMetricsRF);
        setTrainMetricsXGB(data.trainMetricsXGB);
        setFutureForecast(data.futureForecast);
      }
    } catch (err) {
      console.error('Failed to load forecasting metrics: ', err);
    } finally {
      setIsForecastLoading(false);
    }
  };

  const loadSegmentationMetrics = async (k: number) => {
    setIsSegmentationLoading(true);
    try {
      const res = await fetch(`/api/segmentation?k=${k}`);
      const data = await res.json();
      if (data.success) {
        setCentroids(data.centroids);
        setSampleSegments(data.sampleSegments);
        setSegmentMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load segmentation metrics: ', err);
    } finally {
      setIsSegmentationLoading(false);
    }
  };

  // Re-seed Data Pipeline (Module 1 Status Controller)
  const handleRefreshData = async (size: number) => {
    setIsDbLoading(true);
    try {
      const response = await fetch('/api/data/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size })
      });
      const data = await response.json();
      if (data.success) {
        setDbStatus(data);
        // Refresh all segments immediately
        await Promise.all([
          loadDashboardData(),
          loadForecastingMetrics(),
          loadSegmentationMetrics(3)
        ]);
      }
    } catch (err) {
      console.error('Data pipeline cleaning failed: ', err);
    } finally {
      setIsDbLoading(false);
    }
  };

  // Execute terminal SQL Queries (Module 7)
  const handleExecuteSQLQuery = async (sqlQuery: string): Promise<SQLResult> => {
    const res = await fetch('/api/sql/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sqlQuery })
    });
    return await res.json();
  };

  // Chatbot with context-aware RAG decision engine integration (Module 8)
  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
        insightsData: data.dataContextUsed
      };

      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, but I encountered an unexpected error compiling your request.',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // CSV Data Downloader trigger
  const handleTriggerCSVExport = () => {
    const csvRows = [
      ['Customer ID', 'First Name', 'Last Name', 'Age', 'Gross Sales ($)', 'Profit ($)', 'Margin', 'Category', 'Subcategory', 'Region', 'State', 'Product SKU', 'Product Name']
    ];

    // Trigger mock/active download of database sample
    // In a high-quality SPA, we dynamically compile this on the client
    sampleSegments.slice(0, 100).forEach((s) => {
      csvRows.push([
        s.customerId,
        s.fullName.split(' ')[0],
        s.fullName.split(' ')[1] || '',
        '38', // representative age
        String(s.monetary),
        String((s.monetary * 0.35).toFixed(2)),
        '35%',
        'Furniture',
        'Chairs',
        'West',
        'California',
        'PRD-102',
        'Chairs Brand A 100'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'retail_enterprise_database_cleaned.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'home', label: 'Home Overview', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard EDA', icon: BarChart3 },
    { id: 'forecast', label: 'Sales Forecast', icon: LineChart },
    { id: 'segmentation', label: 'Customer Cohorts', icon: Users },
    { id: 'chatbot', label: 'AI Decision Assistant', icon: Bot },
    { id: 'database', label: 'SQL Terminal', icon: Database },
    { id: 'reports', label: 'Executive Reports', icon: Printer }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans antialiased selection:bg-blue-500/30 selection:text-white" id="main-app-container">
      
      {/* Global CSS for Print layouts and custom clean styling scrollbars */}
      <style>{`
        /* Pristine thin scrollbars for dashboard widgets */
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
        
        /* Print rules for compiling pristine PDF layout report sheets */
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #main-app-container {
            display: block !important;
          }
          #sidebar-wrapper, #header-bar, #btn-trigger-print, #reports-view > div:first-child {
            display: none !important;
          }
          #printable-area {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
          #printable-area *, #printable-area span, #printable-area td, #printable-area th {
            color: black !important;
            background: transparent !important;
          }
        }
      `}</style>

      {/* Main layout row */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Sidebar wrapper */}
        <aside
          id="sidebar-wrapper"
          className={`bg-[#1E293B] border-r border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300 relative z-30 ${isSidebarCollapsed ? 'w-20' : 'w-64'} hidden lg:flex`}
        >
          {/* Top Logo Panel */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">RP</span>
              </div>
              {!isSidebarCollapsed && (
                <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-100">
                  RetailPulse <span className="text-blue-500">Pro</span>
                </h1>
              )}
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-slate-500 hover:text-slate-200 transition cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full font-medium text-xs flex items-center gap-3 py-2.5 px-3.5 rounded-lg transition cursor-pointer relative border ${isActive ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/5' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-transparent'}`}
                  id={`nav-link-${item.id}`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !isSidebarCollapsed && (
                    <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Developer Tag */}
          <div className="p-4 border-t border-slate-800 bg-[#0F172A]/45 text-[10px] text-slate-500">
            {!isSidebarCollapsed && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-400">System Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>Analytics Engine:</span>
                  <span className="text-slate-300 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>ML Models:</span>
                  <span className="text-slate-300 font-semibold">Loaded</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>Database:</span>
                  <span className="text-slate-300 font-semibold">Connected</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>AI Assistant:</span>
                  <span className="text-slate-300 font-semibold">Ready</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500">
                  <span>Prediction Engine:</span>
                  <span className="text-slate-300 font-semibold">Ready</span>
                </div>
              </div>
            )}
            {isSidebarCollapsed && <div className="text-center font-bold text-slate-600">IDSS</div>}
          </div>
        </aside>

        {/* Mobile Header Bar */}
        <header id="header-bar" className="lg:hidden bg-[#1E293B] border-b border-slate-800 px-5 py-3.5 flex justify-between items-center relative z-40 w-full shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">RP</span>
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block leading-none">RetailPulse <span className="text-blue-500 font-extrabold">Pro</span></span>
              <span className="text-[9px] text-emerald-400 font-bold">Enterprise IDSS</span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Mobile Overlay Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-[#1E293B] border-b border-slate-800 shadow-2xl p-4 space-y-1.5 animate-fade-in flex flex-col z-40">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full font-medium text-xs flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer border ${isActive ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/40 border-transparent'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Core content workspace frame */}
        <main className="flex-1 overflow-y-auto bg-[#0F172A] p-6 md:p-8 space-y-6">
          
          {/* Active Work View Routing */}
          {activeTab === 'home' && (
            <Home
              status={dbStatus}
              onNavigate={(tab) => setActiveTab(tab)}
              isLoading={isDbLoading}
              onRefreshData={handleRefreshData}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              kpiStats={kpiStats}
              chartsData={chartsData}
              onRefreshKpis={loadDashboardData}
            />
          )}

          {activeTab === 'forecast' && (
            <SalesForecast
              forecastData={forecastData}
              trainMetricsRF={trainMetricsRF}
              trainMetricsXGB={trainMetricsXGB}
              futureForecast={futureForecast}
              isLoading={isForecastLoading}
            />
          )}

          {activeTab === 'segmentation' && (
            <Segmentation
              centroids={centroids}
              sampleSegments={sampleSegments}
              metrics={segmentMetrics}
              onKChange={loadSegmentationMetrics}
              isLoading={isSegmentationLoading}
            />
          )}

          {activeTab === 'chatbot' && (
            <AIChatbot
              chatHistory={chatHistory}
              onSendMessage={handleSendChatMessage}
              isLoading={isChatLoading}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseTerminal
              onExecuteQuery={handleExecuteSQLQuery}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              kpiStats={kpiStats}
              futureForecast={futureForecast}
              centroids={centroids}
              onTriggerCSVExport={handleTriggerCSVExport}
            />
          )}

        </main>

      </div>

    </div>
  );
}
