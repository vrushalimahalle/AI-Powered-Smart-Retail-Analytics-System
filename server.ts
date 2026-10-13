/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { RetailDataEngine } from './server/dataGenerator';
import { runCustomerSegmentation, runSalesForecasting } from './server/ml';
import { SimulatedRetailDatabase } from './server/database';
import { IntelligentRAGEngine } from './server/chatbot';
import open from 'open';

async function startServer() {
  const app = express();
  const PORT = 5000;

  // Body parsing middleware
  app.use(express.json({ limit: '50mb' }));

  // Initialize Data Engines
  console.log('Initializing Retail Data Engines...');
  const dataEngine = new RetailDataEngine();
  
  // Seed initial dataset of 30,000 transactions (fits memory beautifully, highly representative!)
  const seedResult = dataEngine.generateDataset(30000);
  console.log(`Generated ${seedResult.totalRaw} raw retail transactions in ${seedResult.elapsedMs}ms.`);
  
  // Clean & Feature Engineer immediately
  const cleanResult = dataEngine.runCleaningAndFeatureEngineering();
  console.log(`Preprocessed dataset in ${cleanResult.elapsedMs}ms. Outliers handled: ${cleanResult.outliersHandled}. Cleaned count: ${cleanResult.cleanedCount}`);

  // Instantiate SQL and RAG chatbot engines
  const sqlDatabase = new SimulatedRetailDatabase(dataEngine.cleanRecords);
  const ragEngine = new IntelligentRAGEngine(dataEngine.cleanRecords);

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // 1. Data Pipeline Status
  app.get('/api/data/status', (req, res) => {
    res.json({
      success: true,
      rawCount: dataEngine.rawRecords.length,
      cleanCount: dataEngine.cleanRecords.length,
      isPreprocessed: dataEngine.isPreprocessed,
      seedTimeMs: seedResult.elapsedMs,
      preprocessTimeMs: cleanResult.elapsedMs,
      outliersCount: cleanResult.outliersHandled,
      imputedCount: cleanResult.imputedCount
    });
  });

  // 2. Re-trigger Clean and Feature Engineering (Module 1 & 3 demo)
  app.post('/api/data/clean', (req, res) => {
    const size = req.body.size || 30000;
    const reseed = dataEngine.generateDataset(size);
    const reclean = dataEngine.runCleaningAndFeatureEngineering();
    
    // Update active database and RAG engine states
    sqlDatabase.updateRecords(dataEngine.cleanRecords);
    ragEngine.updateRecords(dataEngine.cleanRecords);

    res.json({
      success: true,
      rawCount: dataEngine.rawRecords.length,
      cleanCount: dataEngine.cleanRecords.length,
      seedTimeMs: reseed.elapsedMs,
      preprocessTimeMs: reclean.elapsedMs,
      outliersCount: reclean.outliersHandled,
      imputedCount: reclean.imputedCount
    });
  });

  // 3. KPI Aggregates (Module 2 Dashboard)
  app.get('/api/data/kpis', (req, res) => {
    const records = dataEngine.cleanRecords;
    if (records.length === 0) {
      return res.status(400).json({ success: false, error: 'Database is empty.' });
    }

    const totalSales = records.reduce((sum, r) => sum + r.sales, 0);
    const totalProfit = records.reduce((sum, r) => sum + r.profit, 0);
    const customerIds = new Set(records.map(r => r.customerId));
    const orderIds = new Set(records.map(r => r.orderId));
    const averageDiscount = records.reduce((sum, r) => sum + r.discount, 0) / records.length;
    const averageProfitMargin = totalSales > 0 ? (totalProfit / totalSales) : 0;

    res.json({
      success: true,
      kpis: {
        totalSales: Number(totalSales.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        totalOrders: orderIds.size,
        totalCustomers: customerIds.size,
        averageDiscount: Number((averageDiscount * 100).toFixed(2)),
        averageProfitMargin: Number((averageProfitMargin * 100).toFixed(2))
      }
    });
  });

  // 4. Interactive Charts Data (Module 2 Dashboard)
  app.get('/api/data/charts', (req, res) => {
    const records = dataEngine.cleanRecords;
    if (records.length === 0) {
      return res.status(400).json({ success: false, error: 'Database is empty.' });
    }

    // A. Monthly Sales & Profit Trend
    const monthlyMap: Record<string, { sales: number; profit: number }> = {};
    records.forEach(r => {
      const d = new Date(r.orderDate);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[ym]) monthlyMap[ym] = { sales: 0, profit: 0 };
      monthlyMap[ym].sales += r.sales;
      monthlyMap[ym].profit += r.profit;
    });

    const monthlyTrends = Object.entries(monthlyMap)
      .map(([name, val]) => ({
        name,
        sales: Number(val.sales.toFixed(2)),
        profit: Number(val.profit.toFixed(2))
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // B. Category sales, profit & quantity sold
    const categoryMap: Record<string, { sales: number; profit: number; quantity: number }> = {};
    records.forEach(r => {
      if (!categoryMap[r.categoryOfGoods]) categoryMap[r.categoryOfGoods] = { sales: 0, profit: 0, quantity: 0 };
      categoryMap[r.categoryOfGoods].sales += r.sales;
      categoryMap[r.categoryOfGoods].profit += r.profit;
      categoryMap[r.categoryOfGoods].quantity += r.quantity;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([name, val]) => ({
      name,
      sales: Number(val.sales.toFixed(2)),
      profit: Number(val.profit.toFixed(2)),
      quantity: val.quantity
    }));

    // C. Regional Share
    const regionMap: Record<string, number> = {};
    records.forEach(r => {
      regionMap[r.region] = (regionMap[r.region] || 0) + r.sales;
    });

    const regionalShare = Object.entries(regionMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));

    // D. Customer Segment proportions
    const segmentMap: Record<string, number> = {};
    records.forEach(r => {
      segmentMap[r.segment] = (segmentMap[r.segment] || 0) + r.sales;
    });

    const segmentDist = Object.entries(segmentMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));

    // E. Top Products (Sales & Profitability)
    const productSales: Record<string, { name: string; sales: number; profit: number }> = {};
    records.forEach(r => {
      if (!productSales[r.productId]) {
        productSales[r.productId] = { name: r.productName, sales: 0, profit: 0 };
      }
      productSales[r.productId].sales += r.sales;
      productSales[r.productId].profit += r.profit;
    });

    const topProducts = Object.entries(productSales)
      .map(([id, p]) => ({
        id,
        name: p.name,
        sales: Number(p.sales.toFixed(2)),
        profit: Number(p.profit.toFixed(2))
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // F. Discount Impact on profitability (aggregate bins of discount)
    const discountBins: Record<string, { count: number; profitSum: number; salesSum: number }> = {};
    records.forEach(r => {
      const binLabel = `${(r.discount * 100).toFixed(0)}%`;
      if (!discountBins[binLabel]) {
        discountBins[binLabel] = { count: 0, profitSum: 0, salesSum: 0 };
      }
      discountBins[binLabel].count++;
      discountBins[binLabel].profitSum += r.profit;
      discountBins[binLabel].salesSum += r.sales;
    });

    const discountProfit = Object.entries(discountBins).map(([discount, data]) => ({
      name: discount,
      profit: Number(data.profitSum.toFixed(2)),
      sales: Number(data.salesSum.toFixed(2)),
      margin: data.salesSum > 0 ? Number((data.profitSum / data.salesSum * 100).toFixed(2)) : 0
    }));

    res.json({
      success: true,
      monthlyTrends,
      categoryBreakdown,
      regionalShare,
      segmentDist,
      topProducts,
      discountProfit
    });
  });

  // 5. Customer Segmentation (Module 4)
  app.get('/api/segmentation', (req, res) => {
    const k = req.query.k ? parseInt(req.query.k as string, 10) : 3;
    const result = runCustomerSegmentation(dataEngine.cleanRecords, k);
    res.json({
      success: true,
      centroids: result.centroids,
      metrics: result.metrics,
      // Sample of segments to draw on scatter plot (e.g., first 500 records to prevent browser lag!)
      sampleSegments: result.segments.slice(0, 450)
    });
  });

  // 6. Sales Forecasting (Module 5)
  app.get('/api/forecasting', (req, res) => {
    const result = runSalesForecasting(dataEngine.cleanRecords);
    res.json({
      success: true,
      forecastData: result.forecastData,
      trainMetricsRF: result.trainMetricsRF,
      trainMetricsXGB: result.trainMetricsXGB,
      futureForecast: result.futureForecast
    });
  });

  // 8. SQL Terminal Query Execution (Module 7)
  app.post('/api/sql/execute', (req, res) => {
    const sqlQuery = req.body.sqlQuery;
    if (!sqlQuery) {
      return res.status(400).json({ success: false, error: 'sqlQuery body parameter is required.' });
    }

    const executionResult = sqlDatabase.executeQuery(sqlQuery);
    res.json(executionResult);
  });

  // 9. Context-Aware Decision Assistant Chatbot (Module 8)
  app.post('/api/chatbot/message', async (req, res) => {
    const query = req.body.query;
    if (!query) {
      return res.status(400).json({ success: false, error: 'query body parameter is required.' });
    }

    const result = await ragEngine.handleUserQuery(query);
    res.json({
      success: true,
      text: result.text,
      dataContextUsed: result.dataContextUsed
    });
  });

  // ==========================================
  // MIDDLEWARE & SERVER BOOTSTRAPPING
  // ==========================================

  // For production environments: serve Vite static compiled assets
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // In development mode: mount Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Listen on port 5000 by default, and also port 3000 for platform infrastructure compatibility
 app.listen(PORT, '0.0.0.0', async () => {
  console.log(`====================================================`);
  console.log(`🚀 Retail Analytics System fully active on port ${PORT}`);
  console.log(`   Host Address: http://0.0.0.0:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);

  try {
    await open(`http://localhost:${PORT}`);
  } catch (err) {
    console.error('Failed to open browser:', err);
  }
});

  const ALT_PORT = 3000;
  app.listen(ALT_PORT, '0.0.0.0', () => {
    console.log(`🚀 Platform Compatibility Listener active on port ${ALT_PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Boot Error: ', err);
});
