import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import ProductLocationStoryService from '../services/ProductLocationStoryService.js';

const router = express.Router();

// 設定檔案上傳
const upload = multer({ dest: 'uploads/' });

/**
 * @route   POST /api/csv-import/upload
 * @desc    上傳 CSV 檔案並處理文章
 * @access  Public
 */
router.post('/upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    const userId = 'standalone-user';
    const results = [];
    const csvPath = req.file.path;

    console.log('📂 開始處理 CSV 檔案:', req.file.originalname);

    // 讀取 CSV 檔案
    const parsePromise = new Promise((resolve, reject) => {
      const articles = [];

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // CSV 欄位：序號, 標籤(欄位二), 文章內容, pic_1, ..., url1, url2, url3, url4, url5
          const article = {
            index: row['序號'],
            tag: row[''] || '', // 第二欄是空的欄位名稱（標籤）
            content: row['文章內容'],
            imageUrls: [
              row['url1'],
              row['url2'],
              row['url3'],
              row['url4'],
              row['url5']
            ].filter(url => url && url.trim())
          };

          if (article.content && article.content.trim()) {
            articles.push(article);
          }
        })
        .on('end', () => resolve(articles))
        .on('error', (error) => reject(error));
    });

    const articles = await parsePromise;
    console.log(`✅ 成功解析 ${articles.length} 篇文章`);

    // 刪除上傳的暫存檔案
    fs.unlinkSync(csvPath);

    // 處理每篇文章
    let processedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < Math.min(articles.length, 10); i++) { // 先處理前 10 篇
      const article = articles[i];

      try {
        console.log(`🎨 處理第 ${i + 1}/${Math.min(articles.length, 10)} 篇: ${article.tag || '無標籤'}`);

        // 提取地點座標
        const locations = await ProductLocationStoryService.extractLocations(article.content);
        console.log(`📍 提取到 ${locations.length} 個地點`);

        // 使用 CSV 提供的圖片 URL，對應到提取的地點
        const images = article.imageUrls.map((url, index) => ({
          location: locations[index] || '未知地點',
          supabaseUrl: url,
          url: url
        }));

        // 儲存到 Supabase
        const savedArticle = await ProductLocationStoryService.saveArticle({
          userId,
          contentType: 'product',
          content: article.content,
          formData: {
            tag: article.tag,
            originalIndex: article.index
          },
          locations: locations.slice(0, images.length),
          images: images
        });

        results.push({
          success: true,
          index: article.index,
          tag: article.tag,
          articleId: savedArticle.id,
          imagesCount: images.length
        });

        processedCount++;
        console.log(`✅ 第 ${i + 1} 篇處理完成 (${images.length} 張圖片)`);

      } catch (error) {
        console.error(`❌ 第 ${i + 1} 篇處理失敗:`, error.message);
        results.push({
          success: false,
          index: article.index,
          tag: article.tag,
          error: error.message
        });
        failedCount++;
      }
    }

    console.log(`\n📊 處理完成: 成功 ${processedCount} 篇, 失敗 ${failedCount} 篇`);

    res.json({
      success: true,
      message: `成功處理 ${processedCount} 篇文章`,
      totalArticles: articles.length,
      processedCount,
      failedCount,
      results
    });

  } catch (error) {
    console.error('CSV 處理失敗:', error);

    // 清理暫存檔案
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'CSV 處理失敗'
    });
  }
});

/**
 * @route   GET /api/csv-import/health
 * @desc    健康檢查
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CSV Import API is running'
  });
});

export default router;
