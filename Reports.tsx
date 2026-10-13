/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { FileText, Download, Printer, CheckCircle, Award, Landmark, TrendingUp } from 'lucide-react';
import { KPIStats } from '../types';

interface ReportsProps {
  kpiStats: KPIStats | null;
  futureForecast: any[];
  centroids: any[];
  onTriggerCSVExport: () => void;
}

export default function Reports({ kpiStats, futureForecast, centroids, onTriggerCSVExport }: ReportsProps) {
  const [reportTitle, setReportTitle] = useState<string>("Quarterly Executive Retail Yield & Predictive Intelligence Report");
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleCompileReport = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setIsSuccess(true);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in" id="reports-view">
      
      {/* Exporter Controls bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CSV raw data exporter */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between h-48">
          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" /> Export Clean Transaction Database
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Downloads the complete feature-engineered retail database (cleaned, clipped, and annotated with Age, LTV, and margins) as a standard CSV spreadsheet.
            </p>
          </div>
          <button
            onClick={onTriggerCSVExport}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            id="btn-export-csv"
          >
            Download Database CSV
          </button>
        </div>

        {/* Projections exporter */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between h-48">
          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" /> Download Predictions Ledger
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export future multi-step sales forecast metrics (chronological outlooks for XGBoost & Random Forest) as a CSV file.
            </p>
          </div>
          <button
            onClick={() => {
              const csvRows = [['Month', 'XGBoost Predicted Sales ($)', 'Random Forest Predicted Sales ($)']];
              futureForecast.forEach(f => csvRows.push([f.month, String(f.predictedXGB), String(f.predictedRF)]));
              const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
              const link = document.createElement('a');
              link.setAttribute('href', encodeURI(csvContent));
              link.setAttribute('download', 'retail_future_sales_projections.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 active:scale-95 transition text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            id="btn-export-forecasts"
          >
            Download Forecast CSV
          </button>
        </div>

        {/* Print Layout trigger */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between h-48">
          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-400" /> Compile Print-Ready Layout
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a highly structured, executive business summary. Formatted beautifully for desktop printing or saving directly as a clean PDF document.
            </p>
          </div>
          <button
            onClick={handleCompileReport}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 transition text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-500/20 border border-blue-400/20"
            id="btn-compile-pdf"
          >
            Compile Executive Summary
          </button>
        </div>

      </div>

      {/* Compiled Report Previewer */}
      {(isCompiling || isSuccess) && (
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          
          {/* Previewer bar */}
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400 animate-pulse" /> PRINT PREVIEW SHEET
            </span>
            {isSuccess && (
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 transition active:scale-95 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer border border-blue-500"
                id="btn-trigger-print"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            )}
          </div>

          {/* Compiled report container */}
          <div className="p-8 md:p-12 max-w-4xl mx-auto bg-white text-slate-950 font-sans shadow-inner space-y-8 relative my-6 rounded-xl border border-slate-200" id="printable-area">
            
            {/* watermark border for presentation */}
            <div className="absolute top-4 right-4 text-[10px] text-slate-400 font-mono font-bold tracking-widest border border-slate-200 py-1 px-2 rounded uppercase">
              CONFIDENTIAL REPORT
            </div>

            {/* Header block */}
            <div className="border-b-4 border-slate-900 pb-5 space-y-2">
              <div className="flex justify-between items-baseline flex-wrap gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight uppercase text-slate-900">
                  AI-Powered Smart Retail Analytics Platform
                </h1>
                <span className="text-xs font-mono text-slate-500 font-bold">DATE: {new Date().toLocaleDateString()}</span>
              </div>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full text-base font-bold text-blue-900 border-none bg-slate-50 focus:outline-none p-1.5 rounded"
                title="Editable Report Title"
              />
              <p className="text-[10px] font-mono text-slate-500">Prepared by: Chief Retail Scientist Portfolio Node</p>
            </div>

            {/* Factual financial summaries */}
            {kpiStats && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Landmark className="w-4 h-4 text-slate-600" /> I. Financial Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-sans pt-1">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Gross Sales Revenue</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">${kpiStats.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Net Operating Profit</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">${kpiStats.totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Unique Orders</span>
                    <span className="text-base font-extrabold font-mono text-slate-900">{kpiStats.totalOrders.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Operating Profit Margin</span>
                    <span className="text-base font-extrabold font-mono text-blue-950">{kpiStats.averageProfitMargin}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Customer segments centroids summaries */}
            {centroids && centroids.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Award className="w-4 h-4 text-slate-600" /> II. RFM Customer Segments (K-Means Clustering)
                </h3>
                <table className="w-full text-left text-xs border border-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Segment Cohort</th>
                      <th className="py-2 px-3">Size (Count)</th>
                      <th className="py-2 px-3">Avg Monetary ($)</th>
                      <th className="py-2 px-3">Avg Order Freq</th>
                      <th className="py-2 px-3">Avg Recency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {centroids.map((c) => (
                      <tr key={c.cluster}>
                        <td className="py-2 px-3 font-semibold text-slate-900 font-sans">{c.segmentLabel} Cohort</td>
                        <td className="py-2 px-3">{c.count} members</td>
                        <td className="py-2 px-3 font-bold">${c.monetary.toLocaleString()}</td>
                        <td className="py-2 px-3">{c.frequency} times</td>
                        <td className="py-2 px-3">{c.recency} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Forecaster Projections short table */}
            {futureForecast && futureForecast.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-slate-600" /> III. 6-Month Time Series Outlook (XGBoost Projections)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-mono text-center">
                  {futureForecast.slice(0, 6).map((f) => (
                    <div key={f.month} className="bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="font-sans font-bold text-slate-500 block">{f.month}</span>
                      <span className="font-extrabold text-slate-900">${f.predictedXGB.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Executive Recommendations */}
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-900 uppercase">IV. Strategic Executive Recommendations</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-slate-700 leading-relaxed font-sans">
                <li>Deploy active retargeting campaigns for high-recency gaps identified inside the **Budget** customer segment.</li>
                <li>Leverage seasonal cyclical multipliers captured by the **XGBoost regressor** to align logistics stock thresholds 45 days in advance of peak forecasts.</li>
                <li>Focus loyalty upsells directly on high-yield **Regular segment** members having purchase counts between 4 and 8.</li>
              </ul>
            </div>

            {/* Signature node */}
            <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Report ID: REP-{Math.floor(100000 + Math.random() * 900000)}</span>
              <span>Authorization Stamp: APPROVED FOR BOARD REVIEW</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
