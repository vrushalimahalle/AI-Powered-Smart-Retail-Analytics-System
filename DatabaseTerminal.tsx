/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Database, Terminal, Play, FileCode, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { SQLResult } from '../types';

interface DatabaseTerminalProps {
  onExecuteQuery: (sql: string) => Promise<SQLResult>;
}

export default function DatabaseTerminal({ onExecuteQuery }: DatabaseTerminalProps) {
  const [queryText, setQueryText] = useState<string>("SELECT categoryOfGoods, SUM(sales), AVG(profit) FROM sales GROUP BY categoryOfGoods ORDER BY SUM(sales) DESC");
  const [result, setResult] = useState<SQLResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const runSimulatedSQL = async (sql: string) => {
    setIsLoading(true);
    setTerminalLogs([
      `[info] ${new Date().toISOString().split('T')[1].slice(0, 8)} - Connection requested to 'retail_database.db'`,
      `[info] Parsing SQL query: "${sql}"`,
      `[info] Query Optimizer initiating logical execution compilation...`
    ]);

    try {
      // Small artificial delay to let terminal output logs compile beautifully
      await new Promise((res) => setTimeout(res, 300));
      const resVal = await onExecuteQuery(sql);

      setResult(resVal);

      if (resVal.success) {
        setTerminalLogs((prev) => [
          ...prev,
          `[success] AST compiled successfully. Plan: INDEX SCAN on table 'sales'`,
          `[success] Filtering complete. Scanning rows matching criteria...`,
          `[success] Computed aggregates in ${resVal.executionTimeMs}ms. Yielded ${resVal.rowCount} result rows.`,
          `[success] Query complete. Buffer flushed to stdout.`
        ]);
      } else {
        setTerminalLogs((prev) => [
          ...prev,
          `[error] Parser failed during syntax parsing check.`,
          `[error] Error message: "${resVal.errorMessage}"`
        ]);
      }

    } catch (err: any) {
      setResult({
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs: 0,
        sqlQuery: sql,
        errorMessage: err.message || 'System crash during database execution.'
      });
      setTerminalLogs((prev) => [
        ...prev,
        `[error] System crash: Fatal communication error during database scan.`
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetQuery = (sql: string) => {
    setQueryText(sql);
    runSimulatedSQL(sql);
  };

  const schemaColumns = [
    { name: 'customerId', type: 'VARCHAR(24)', desc: 'Unique customer identifier' },
    { name: 'customerName', type: 'VARCHAR(64)', desc: 'First name of the customer' },
    { name: 'sales', type: 'FLOAT', desc: 'Gross sales value ($)' },
    { name: 'year', type: 'INTEGER', desc: 'Fiscal year of sale' },
    { name: 'categoryOfGoods', type: 'VARCHAR(128)', desc: 'Core product category' },
    { name: 'region', type: 'VARCHAR(32)', desc: 'North, South, East, West region' },
    { name: 'state', type: 'VARCHAR(64)', desc: 'State of purchase' },
    { name: 'productName', type: 'VARCHAR(256)', desc: 'Full description name of item' },
    { name: 'quantity', type: 'INTEGER', desc: 'Total volume sold' },
    { name: 'discount', type: 'FLOAT', desc: 'Campaign discount percentage (0 - 0.50)' },
    { name: 'profit', type: 'FLOAT', desc: 'Calculated profit yield ($)' }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="database-view">
      
      {/* Schema Structure & Query Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Schema explorer */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Database className="w-5 h-5 text-blue-400" /> Schema Explorer (`sales` table)
          </h3>
          <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
            {schemaColumns.map((col) => (
              <div key={col.name} className="flex justify-between items-start gap-4 text-xs">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-slate-200">{col.name}</span>
                  <span className="text-[10px] text-slate-500 block">{col.desc}</span>
                </div>
                <span className="bg-slate-900/60 text-blue-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-750">
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: SQL Editor & Preset box */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          
          {/* Query Preset Buttons */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Example Academic SQL Queries</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPresetQuery("SELECT * FROM sales WHERE sales > 1000 ORDER BY sales DESC LIMIT 5")}
                className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                High Value Sales
              </button>
              <button
                onClick={() => setPresetQuery("SELECT categoryOfGoods, SUM(sales), AVG(profit) FROM sales GROUP BY categoryOfGoods ORDER BY SUM(sales) DESC")}
                className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                Category Margins
              </button>
              <button
                onClick={() => setPresetQuery("SELECT region, SUM(sales) FROM sales GROUP BY region ORDER BY SUM(sales) DESC")}
                className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                Regional Yield
              </button>
              <button
                onClick={() => setPresetQuery("SELECT state, SUM(profit) FROM sales GROUP BY state ORDER BY SUM(profit) DESC LIMIT 5")}
                className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                Top Profit States
              </button>
            </div>
          </div>

          {/* Core SQL editor box */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4 flex-1 flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1">
                <FileCode className="w-4 h-4 text-blue-400" /> Relational SQL Workspace
              </span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">SQLite-Compliant Parser</span>
            </div>
            
            <textarea
              rows={4}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="w-full bg-slate-950 text-emerald-400 font-mono text-sm py-3 px-4 rounded-xl border border-slate-800/60 focus:outline-none focus:border-blue-500 resize-none flex-1"
            />

            <div className="flex justify-end pt-3">
              <button
                disabled={isLoading}
                onClick={() => runSimulatedSQL(queryText)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition active:scale-95 text-white font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 text-sm"
                id="btn-execute-sql"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute SQL
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Terminal logs & Output box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Terminal logs side-panel */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-xl h-[360px] flex flex-col font-mono">
          <div className="flex items-center gap-2 border-b border-slate-800/85 pb-3 mb-3 text-slate-400 text-xs font-semibold">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Database Compiler Terminal</span>
          </div>
          <div className="flex-1 overflow-y-auto text-[10px] space-y-1.5 text-slate-400">
            {terminalLogs.map((log, idx) => {
              const color = log.includes('[success]')
                ? 'text-emerald-400'
                : log.includes('[error]')
                ? 'text-rose-400'
                : 'text-slate-400';
              return (
                <div key={idx} className={color}>
                  {log.replace(/\[(success|error|info)\]\s+/, '')}
                </div>
              );
            })}
            {terminalLogs.length === 0 && (
              <p className="text-slate-600 italic">No instructions logged yet. Run a query to prompt diagnostic analytics.</p>
            )}
          </div>
        </div>

        {/* SQL Results panel */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl h-[360px] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> Execution Results Grid
            </h4>
            {result?.success && (
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-lg font-bold font-mono">
                Fetched {result.rowCount} rows in {result.executionTimeMs}ms
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs text-slate-500 font-mono">Buffer flushing and aggregates sorting in progress...</p>
              </div>
            ) : result ? (
              result.success ? (
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-[#1E293B]/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-850 sticky top-0">
                    <tr>
                      {result.columns.map((col) => (
                        <th key={col} className="py-3 px-4">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/10">
                        {result.columns.map((col) => (
                          <td key={col} className="py-2.5 px-4 truncate max-w-[200px]" title={String(row[col])}>
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 text-rose-400">
                  <HelpCircle className="w-8 h-8" />
                  <p className="font-bold text-sm">Query Compilation Failed</p>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-md">{result.errorMessage}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-12 space-y-2">
                <Database className="w-8 h-8" />
                <p className="text-xs">Execute a custom SELECT query to display output vectors here</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
