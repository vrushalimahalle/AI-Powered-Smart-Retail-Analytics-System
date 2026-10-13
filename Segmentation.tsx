/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label, Cell, Legend } from 'recharts';
import { Users, Sparkles, RefreshCcw, TrendingUp, Landmark, ShieldCheck } from 'lucide-react';
import { SegmentInfo, ClusterCentroid } from '../types';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

interface SegmentationProps {
  centroids: ClusterCentroid[];
  sampleSegments: SegmentInfo[];
  metrics: any;
  onKChange: (k: number) => void;
  isLoading: boolean;
}

export default function Segmentation({ centroids, sampleSegments, metrics, onKChange, isLoading }: SegmentationProps) {
  const [kValue, setKValue] = useState<number>(3);

  const handleKSliderChange = (val: number) => {
    setKValue(val);
    onKChange(val);
  };

  // Group sample points by segment label for Recharts Scatter series
  const scatterSeries = (() => {
    const groups: Record<string, any[]> = {};
    sampleSegments.forEach((pt) => {
      if (!groups[pt.segmentLabel]) {
        groups[pt.segmentLabel] = [];
      }
      groups[pt.segmentLabel].push({
        x: pt.x,
        y: pt.y,
        name: pt.fullName,
        monetary: pt.monetary,
        frequency: pt.frequency,
        recency: pt.recency,
        segmentLabel: pt.segmentLabel
      });
    });

    return Object.entries(groups).map(([label, points]) => ({
      label,
      points
    }));
  })();

  const colorMap: Record<string, string> = {
    'Premium': '#10B981', // emerald
    'Regular': '#F59E0B', // amber
    'Budget': '#EF4444'   // red
  };

  const getCohortDescription = (label: string) => {
    switch (label) {
      case 'Premium':
        return 'Highest spending threshold, extremely high purchase frequency, recently active. Direct marketing targets for new premium products.';
      case 'Regular':
        return 'Moderate purchase frequency and spend volume. Strong potential for upselling and loyalty program engagement campaigns.';
      case 'Budget':
        return 'Low individual ticket sizes, longer recency gaps. Responds well to targeted bulk discounts, seasonal clearances, and retention hooks.';
      default:
        return 'Standard customer cohort.';
    }
  };

  if (isLoading || sampleSegments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <RefreshCcw className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium">Computing RFM matrices, MinMax scaling, and executing mathematical K-Means clustering...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="segmentation-view">
      
      {/* Parameters & Cluster Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* K-Means Slider Control */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> K-Means Parameters
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dynamically partition the customer database into custom cluster cohorts. Recalculate centroids instantly.
            </p>
          </div>
          <div className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span>Number of Clusters (K)</span>
                <span className="text-blue-400 text-sm font-extrabold">{kValue} Clusters</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                value={kValue}
                onChange={(e) => handleKSliderChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                id="slider-kmeans"
              />
              <div className="flex justify-between text-[10px] text-slate-600 font-semibold uppercase">
                <span>2 (Coarse)</span>
                <span>3 (Default)</span>
                <span>4 (Granular)</span>
                <span>5 (Dense)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Convergence Metrics */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <h3 className="font-bold text-lg text-slate-100 border-b border-slate-800/80 pb-3">
            🎯 Model Convergence
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center py-2">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Iterations</div>
              <div className="text-2xl font-extrabold text-blue-400">{metrics?.iterations || 0} steps</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">WCSS Loss</div>
              <div className="text-2xl font-extrabold text-emerald-400">{metrics?.wcss || 0}</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            WCSS measures within-cluster sum of squares. Lower values represent tighter clustering boundaries. Convergence achieved in less than 5ms.
          </p>
        </div>

        {/* RFM Model Summary */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Model Accuracy
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              RFM scores are normalized via MinMax Scaler: <br/>
              <code>X_norm = (X - X_min) / (X_max - X_min)</code>
            </p>
          </div>
          <div className="pt-4 flex items-center gap-2 bg-slate-800/30 border border-slate-800 p-3 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 leading-relaxed">
              Clusters are sorted and classified by **Average Lifetime Spending** to ensure high-fidelity business representation.
            </span>
          </div>
        </div>

      </div>

      {/* 2D Multi-Cluster Projection Map (RFM Scatter Plot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scatter plot visualizer */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 shadow-xl lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-100 flex justify-between items-center">
            <span>👥 Normalized RFM Vector Projection Scatter Plot</span>
            <span className="text-xs text-blue-400 font-semibold">Sample density projection</span>
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="x" name="Monetary Index" stroke="#64748B" fontSize={10} tickLine={false}>
                  <Label value="Monetary Spending Index →" offset={0} position="insideBottom" stroke="#475569" fontSize={11} />
                </XAxis>
                <YAxis type="number" dataKey="y" name="Frequency Index" stroke="#64748B" fontSize={10} tickLine={false}>
                  <Label value="Order Frequency Index" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} stroke="#475569" fontSize={11} />
                </YAxis>
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-xl space-y-1">
                          <p className="font-bold text-white text-sm">{data.name}</p>
                          <p className="text-xs text-indigo-400 font-semibold">{data.segmentLabel} Segment</p>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 mt-1 space-y-0.5 font-mono">
                            <p>Monetary Spend: ${data.monetary.toLocaleString()}</p>
                            <p>Frequency: {data.frequency} orders</p>
                            <p>Recency: {data.recency} days ago</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                {scatterSeries.map((series, idx) => (
                  <Scatter
                    key={idx}
                    name={series.label}
                    data={series.points}
                    fill={colorMap[series.label] || COLORS[idx % COLORS.length]}
                    shape="circle"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Centroid RFM Profile Lists */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-100">📋 Centroid Cohort Profiles</h3>
          {centroids.map((c, idx) => {
            const color = colorMap[c.segmentLabel] || COLORS[idx % COLORS.length];
            return (
              <div key={idx} className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                    {c.segmentLabel} Segment
                  </span>
                  <span className="text-xs text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-lg">
                    {c.count} Customers
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold">Avg Spend</div>
                    <div className="font-extrabold text-white font-mono">${c.monetary.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold">Avg Orders</div>
                    <div className="font-extrabold text-white font-mono">{c.frequency}x</div>
                  </div>
                  <div className="bg-slate-850 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 font-semibold">Avg Recency</div>
                    <div className="font-extrabold text-white font-mono">{c.recency}d</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                  {getCohortDescription(c.segmentLabel)}
                </p>
              </div>
            );
          })}
        </div>

      </div>

      {/* Cohort Customer Listings Samples */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Representative Segment Samples
          </h3>
          <span className="text-xs text-slate-500 font-semibold font-mono">Simulated Clustering Assignments</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#1E293B]/60 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Customer ID</th>
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">Total Spending ($)</th>
                <th className="py-4 px-6">Order Frequency</th>
                <th className="py-4 px-6">Recency Gap (Days)</th>
                <th className="py-4 px-6">Assigned Cohort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sampleSegments.slice(0, 10).map((pt, idx) => {
                const color = colorMap[pt.segmentLabel] || '#CBD5E1';
                return (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-6 font-mono text-blue-400">{pt.customerId}</td>
                    <td className="py-3 px-6 font-semibold text-white">{pt.fullName}</td>
                    <td className="py-3 px-6 font-mono text-slate-200">${pt.monetary.toLocaleString()}</td>
                    <td className="py-3 px-6 font-mono">{pt.frequency} times</td>
                    <td className="py-3 px-6 font-mono">{pt.recency} days ago</td>
                    <td className="py-3 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5" style={{ backgroundColor: `${color}15`, color: color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                        {pt.segmentLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
