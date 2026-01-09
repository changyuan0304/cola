import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import productLocationStoryRoutes from './routes/product-location-story.js';
import csvImportRoutes from './routes/csv-import.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/product-location-story', productLocationStoryRoutes);
app.use('/api/csv-import', csvImportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Product Location Story API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 商品地點故事生成器 API 已啟動`);
  console.log(`📍 服務地址: http://localhost:${PORT}`);
  console.log(`🏥 健康檢查: http://localhost:${PORT}/api/health\n`);
});
