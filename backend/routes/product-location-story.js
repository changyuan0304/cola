import express from 'express';
import ProductLocationStoryService from '../services/ProductLocationStoryService.js';

const router = express.Router();

/**
 * @route   POST /api/product-location-story/scrape-url
 * @desc    爬取商品網頁內容
 * @access  Public
 */
router.post('/scrape-url', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: '網址不可為空'
      });
    }

    // 驗證 URL 格式
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: '無效的網址格式'
      });
    }

    console.log('🕷️ 開始爬取網頁:', url);

    const result = await ProductLocationStoryService.scrapeProductUrl(url);

    res.json(result);
  } catch (error) {
    console.error('爬取失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '網頁爬取失敗'
    });
  }
});

/**
 * @route   POST /api/product-location-story/generate-content
 * @desc    生成商品故事文案
 * @access  Public (獨立專案無需認證)
 */
router.post('/generate-content', async (req, res) => {
  try {
    const { productName, productInfo, wordCount } = req.body;

    // 驗證必填欄位
    if (!productName || !productInfo) {
      return res.status(400).json({
        success: false,
        message: '商品名稱和商品資訊為必填欄位'
      });
    }

    console.log('📝 開始生成商品故事...');
    console.log('商品名稱:', productName);
    console.log('字數設定:', wordCount || '200-300');

    // 生成文案
    const content = await ProductLocationStoryService.generateContent({
      productInfo,
      wordCount: wordCount || '200-300'
    });

    console.log('✅ 文案生成成功');

    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('生成文案失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成文案時發生錯誤'
    });
  }
});

/**
 * @route   POST /api/product-location-story/generate-images
 * @desc    從文案提取地點並生成 Street View 圖片，並儲存到 Supabase
 * @access  Public (獨立專案無需認證)
 */
router.post('/generate-images', async (req, res) => {
  try {
    const { content, contentType, formData } = req.body;
    const userId = 'standalone-user'; // 獨立專案使用固定 userId

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '文案內容不可為空'
      });
    }

    console.log('🎨 開始生成地點圖片...');

    // 生成圖片並上傳
    const result = await ProductLocationStoryService.generateAndUploadImages(content, userId);

    console.log('✅ 圖片生成成功，共', result.images.length, '張');

    // 儲存文章到 Supabase
    try {
      const savedArticle = await ProductLocationStoryService.saveArticle({
        userId,
        contentType: contentType || 'product',
        content,
        formData: formData || {},
        locations: result.locations,
        images: result.images
      });

      console.log('✅ 文章已儲存到 Supabase:', savedArticle.id);

      res.json({
        success: true,
        locations: result.locations,
        images: result.images,
        articleId: savedArticle.id
      });
    } catch (saveError) {
      // 即使儲存失敗，仍返回圖片結果
      console.error('⚠️  儲存文章失敗，但圖片已生成:', saveError);
      res.json({
        success: true,
        locations: result.locations,
        images: result.images,
        warning: '圖片已生成，但儲存到資料庫失敗'
      });
    }
  } catch (error) {
    console.error('生成圖片失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '生成圖片時發生錯誤'
    });
  }
});

/**
 * @route   POST /api/product-location-story/extract-locations
 * @desc    僅提取地點座標（不生成圖片）
 * @access  Public
 */
router.post('/extract-locations', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '文案內容不可為空'
      });
    }

    console.log('🔍 開始提取地點...');

    const locations = await ProductLocationStoryService.extractLocations(content);

    console.log('✅ 提取到', locations.length, '個地點');

    res.json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('提取地點失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '提取地點時發生錯誤'
    });
  }
});

/**
 * @route   POST /api/product-location-story/fetch-popular-tours
 * @desc    爬取並整理熱門行程（支援從資料庫快取或強制重新爬取）
 * @access  Public
 */
router.post('/fetch-popular-tours', async (req, res) => {
  try {
    const { forceRefresh } = req.body;

    if (forceRefresh) {
      console.log('🔄 強制重新爬取熱門行程...');
    } else {
      console.log('🔥 獲取熱門行程（優先使用快取）...');
    }

    const result = await ProductLocationStoryService.fetchAndOrganizePopularTours(forceRefresh || false);

    res.json(result);
  } catch (error) {
    console.error('爬取熱門行程失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '爬取熱門行程失敗'
    });
  }
});

/**
 * @route   GET /api/product-location-story/articles
 * @desc    獲取文章列表
 * @access  Public
 */
router.get('/articles', async (req, res) => {
  try {
    const userId = 'standalone-user';
    const limit = parseInt(req.query.limit) || 50;

    console.log('📚 獲取文章列表...');

    const articles = await ProductLocationStoryService.getArticles(userId, limit);

    console.log(`✅ 找到 ${articles.length} 篇文章`);

    res.json({
      success: true,
      articles,
      count: articles.length
    });
  } catch (error) {
    console.error('獲取文章列表失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取文章列表時發生錯誤'
    });
  }
});

/**
 * @route   DELETE /api/product-location-story/articles/:id
 * @desc    刪除文章
 * @access  Public
 */
router.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️  刪除文章: ${id}`);

    const result = await ProductLocationStoryService.deleteArticle(id);

    console.log('✅ 文章已刪除');

    res.json({
      success: true,
      message: '文章已刪除'
    });
  } catch (error) {
    console.error('刪除文章失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '刪除文章時發生錯誤'
    });
  }
});

/**
 * @route   PATCH /api/product-location-story/articles/:id
 * @desc    更新文章狀態
 * @access  Public
 */
router.patch('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['generated', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '狀態必須是 generated 或 published'
      });
    }

    console.log(`📝 更新文章狀態: ${id} -> ${status}`);

    const result = await ProductLocationStoryService.updateArticleStatus(id, status);

    console.log('✅ 文章狀態已更新');

    res.json({
      success: true,
      message: '文章狀態已更新',
      article: result
    });
  } catch (error) {
    console.error('更新文章狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新文章狀態時發生錯誤'
    });
  }
});

/**
 * @route   GET /api/product-location-story/health
 * @desc    健康檢查
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Product Location Story API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
