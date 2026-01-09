import OpenAI from 'openai';
import axios from 'axios';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

class ProductLocationStoryService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Google Maps API Key
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyCuVOJQVQ6PLQAZw5lGXkexCHtP14GGufI';

    // Supabase 配置
    this.supabase = createClient(
      process.env.SUPABASE_URL || 'https://rvhliehksruemfpcwxzp.supabase.co',
      process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2aGxpZWhrc3J1ZW1mcGN3eHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NDM5NjQsImV4cCI6MjA1MTAxOTk2NH0.dNOYUEpqIBdoiFIq2Fj_DmFYbvPr8n_QWJ2-ue0PNAw'
    );

    // CSV 範例文章路徑
    this.csvPath = '/Users/yu-an/Downloads/threads_posts_20260102T093557.csv';
  }

  /**
   * 從 CSV 隨機抽取一篇貼文作為寫作範例
   */
  getRandomThreadsPost() {
    try {
      // 讀取 CSV 文件
      const csvContent = fs.readFileSync(this.csvPath, 'utf-8');

      // 解析 CSV
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        bom: true // 處理 UTF-8 BOM
      });

      // 過濾出有效的貼文（內容長度大於 50 字）
      const validPosts = records.filter(record => {
        const content = record['貼文內容'] || '';
        return content.length > 50 && content.length < 500;
      });

      if (validPosts.length === 0) {
        console.log('⚠️ CSV 中沒有找到有效的貼文範例');
        return '';
      }

      // 隨機選擇一篇
      const randomPost = validPosts[Math.floor(Math.random() * validPosts.length)];
      const content = randomPost['貼文內容'] || '';

      console.log('📝 已隨機選擇一篇範例文章（字數：', content.length, '）');
      console.log('範例預覽：', content.substring(0, 100), '...');

      return content;
    } catch (error) {
      console.error('❌ 讀取 CSV 失敗:', error.message);
      return '';
    }
  }

  /**
   * 爬取商品網頁內容
   */
  async scrapeProductUrl(url) {
    try {
      console.log('🕷️ 開始爬取網頁:', url);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000,
        maxRedirects: 5
      });

      const $ = cheerio.load(response.data);

      // 移除不需要的元素
      $('script').remove();
      $('style').remove();
      $('noscript').remove();
      $('iframe').remove();

      // 提取網頁標題
      const pageTitle = $('title').text().trim() ||
                       $('h1').first().text().trim() ||
                       '';

      // 提取主要內容
      let mainContent = '';

      // 嘗試常見的主要內容選擇器
      const contentSelectors = [
        'main',
        'article',
        '.product-description',
        '.product-info',
        '.description',
        '#description',
        '.content',
        'body'
      ];

      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          mainContent = element.text().trim();
          if (mainContent.length > 100) break;
        }
      }

      // 清理文字
      mainContent = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim()
        .substring(0, 2000); // 限制長度

      // 提取所有段落
      const paragraphs = [];
      $('p').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 20 && text.length < 500) {
          paragraphs.push(text);
        }
      });

      console.log('✅ 爬取成功，找到', paragraphs.length, '個段落');

      return {
        success: true,
        title: pageTitle,
        content: mainContent,
        paragraphs: paragraphs.slice(0, 10), // 最多10個段落
        url: url
      };

    } catch (error) {
      console.error('爬取失敗:', error.message);
      throw new Error('網頁爬取失敗: ' + error.message);
    }
  }

  /**
   * 生成商品故事文案（Product - 商品/經驗分享）
   */
  async generateContent(productData) {
    const { productInfo, wordCount = '200-300' } = productData;

    // 從 CSV 隨機抽取一篇範例文章
    const examplePost = this.getRandomThreadsPost();

    const systemPrompt = '你是一位真實的旅遊經驗分享者，用自然口吻推薦可樂旅遊。';

    const prompt = `這裏的人設是想下訂單或是已經訂購行程想去的，但還沒去

${productInfo}

根據活動內容隨機抽取一個段落的資訊
參考這篇文寫法，把這篇文改寫
${examplePost}

產出推薦可樂旅遊的真實經驗分享文章
加入人物、故事、時間點，越具體越好象是真的一樣
不要直接講到年份和價格和準確日期
越口語越好，情緒多一點

**重要格式要求：**
1. 每一行最多 20 字就要換行
2. 不要有句號，偶爾逗號換成空格
3. 禁止出現「我是小美」、「我叫阿傑」等自我介紹的人名
4. 必須提到 3-5 個具體的地點名稱（例如：景點、城市、國家等）
5. 禁止像業配

**字數要求：** ${wordCount} 字內（嚴格遵守）`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('生成文案失敗:', error);
      throw new Error('AI 文案生成失敗');
    }
  }

  /**
   * 從文案中提取地點座標
   */
  async extractLocations(content) {
    const prompt = `請從以下文案中提取 5 個與內容相關的地點，並提供這些地點的經緯度座標。

文案內容：
${content}

要求：
1. 優先選擇文案中明確提到的地點
2. 如果文案中的地點不足 5 個，可以選擇相關的知名景點或街道
3. 座標格式：緯度,經度（例如：46.414382,10.013988）
4. 確保座標準確，對應真實存在的地點

請以 JSON 格式輸出，格式如下：
{
  "locations": [
    "46.414382,10.013988",
    "46.415120,10.012450",
    "46.413900,10.015210",
    "46.413900,10.015210",
    "46.413900,10.015210"
  ]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '你是一位地理資訊專家，能夠準確識別地點並提供經緯度座標。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const result = JSON.parse(completion.choices[0].message.content);
      return result.locations || [];
    } catch (error) {
      console.error('提取地點失敗:', error);
      throw new Error('地點提取失敗');
    }
  }

  /**
   * 獲取 Street View 圖片
   */
  async getStreetViewImage(location) {
    const size = '600x300';
    const heading = 151.7;
    const pitch = -0.76;

    const url = `https://maps.googleapis.com/maps/api/streetview?` +
      `size=${size}&` +
      `location=${encodeURIComponent(location)}&` +
      `heading=${heading}&` +
      `pitch=${pitch}&` +
      `return_error_code=true&` +
      `key=${this.googleMapsApiKey}`;

    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        validateStatus: (status) => status === 200
      });

      return {
        success: true,
        imageBuffer: Buffer.from(response.data),
        url
      };
    } catch (error) {
      console.error(`獲取 Street View 圖片失敗 (${location}):`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 裁切圖片底部 10%
   */
  async cropBottomImage(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      // 計算裁切後的高度（去掉底部 10%）
      const newHeight = Math.floor(height * 0.9);

      const croppedBuffer = await sharp(imageBuffer)
        .extract({
          left: 0,
          top: 0,
          width: width,
          height: newHeight
        })
        .toBuffer();

      return croppedBuffer;
    } catch (error) {
      console.error('圖片裁切失敗:', error);
      throw new Error('圖片裁切失敗');
    }
  }

  /**
   * 上傳圖片到 Supabase
   */
  async uploadToSupabase(imageBuffer, filename) {
    try {
      const bucketName = 'product-location-images';

      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(filename, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        // 如果 bucket 不存在，嘗試創建它
        if (error.message.includes('not found') || error.statusCode === '404') {
          console.log('📦 Bucket 不存在，正在創建...');
          const { error: bucketError } = await this.supabase.storage
            .createBucket(bucketName, { public: true });

          if (!bucketError || bucketError.message.includes('already exists')) {
            // 重試上傳
            const { data: retryData, error: retryError } = await this.supabase.storage
              .from(bucketName)
              .upload(filename, imageBuffer, {
                contentType: 'image/jpeg',
                upsert: true
              });

            if (retryError) {
              console.error('重試上傳失敗:', retryError);
              throw retryError;
            }

            console.log('✅ Bucket 創建成功，檔案已上傳');
            // 繼續獲取公開 URL
          } else {
            console.error('創建 Bucket 失敗:', bucketError);
            throw bucketError;
          }
        } else {
          console.error('Supabase 上傳失敗:', error);
          throw error;
        }
      }

      // 獲取公開 URL
      const { data: publicUrlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(filename);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('上傳到 Supabase 失敗:', error);
      throw new Error('圖片上傳失敗');
    }
  }

  /**
   * 處理整個流程：生成圖片並上傳
   */
  async generateAndUploadImages(content, userId) {
    try {
      // 1. 提取地點
      console.log('🔍 正在提取地點...');
      const locations = await this.extractLocations(content);
      console.log('✅ 提取到地點:', locations);

      // 2. 為每個地點生成圖片
      const results = [];

      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        console.log(`📸 正在處理地點 ${i + 1}/${locations.length}: ${location}`);

        // 獲取 Street View 圖片
        const streetViewResult = await this.getStreetViewImage(location);

        if (!streetViewResult.success) {
          console.warn(`⚠️  地點 ${location} 無法獲取圖片，跳過`);
          continue;
        }

        // 裁切圖片（去掉底部 10%）
        const croppedBuffer = await this.cropBottomImage(streetViewResult.imageBuffer);

        // 上傳到 Supabase
        const timestamp = Date.now();
        const filename = `${userId}/${timestamp}_${i + 1}.jpg`;
        const supabaseUrl = await this.uploadToSupabase(croppedBuffer, filename);

        results.push({
          location,
          url: streetViewResult.url,
          supabaseUrl
        });

        console.log(`✅ 地點 ${i + 1} 處理完成`);
      }

      return {
        locations,
        images: results
      };
    } catch (error) {
      console.error('生成圖片流程失敗:', error);
      throw error;
    }
  }

  /**
   * 儲存文章到 Supabase
   */
  async saveArticle(articleData) {
    try {
      const { userId = 'standalone-user', contentType, content, formData, locations, images } = articleData;

      const { data, error } = await this.supabase
        .from('articles')
        .insert({
          user_id: userId,
          content_type: contentType,
          content,
          form_data: formData,
          locations,
          images
        })
        .select()
        .single();

      if (error) {
        console.error('儲存文章失敗:', error);
        throw error;
      }

      console.log('✅ 文章已儲存到 Supabase:', data.id);
      return data;
    } catch (error) {
      console.error('儲存文章到 Supabase 失敗:', error);
      throw new Error('文章儲存失敗');
    }
  }

  /**
   * 獲取文章列表
   */
  async getArticles(userId = 'standalone-user', limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('articles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('獲取文章列表失敗:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('從 Supabase 獲取文章失敗:', error);
      throw new Error('獲取文章列表失敗');
    }
  }

  /**
   * 刪除文章
   */
  async deleteArticle(articleId) {
    try {
      const { error } = await this.supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        console.error('刪除文章失敗:', error);
        throw error;
      }

      console.log('✅ 文章已從資料庫刪除:', articleId);
      return { success: true };
    } catch (error) {
      console.error('從 Supabase 刪除文章失敗:', error);
      throw new Error('刪除文章失敗');
    }
  }

  /**
   * 更新文章狀態
   */
  async updateArticleStatus(articleId, status) {
    try {
      const { data, error } = await this.supabase
        .from('articles')
        .update({ status })
        .eq('id', articleId)
        .select()
        .single();

      if (error) {
        console.error('更新文章狀態失敗:', error);
        throw error;
      }

      console.log('✅ 文章狀態已更新:', articleId, '->', status);
      return data;
    } catch (error) {
      console.error('從 Supabase 更新文章狀態失敗:', error);
      throw new Error('更新文章狀態失敗');
    }
  }

  /**
   * 從 Supabase 讀取熱門行程
   */
  async getToursFromDatabase() {
    try {
      console.log('📖 從資料庫讀取熱門行程...');

      const { data, error } = await this.supabase
        .from('popular_tours')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('資料庫讀取失敗:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('⚠️  資料庫中沒有行程資料');
        return null;
      }

      // 將資料庫格式轉換為 API 格式
      const eztravel = data.filter(t => t.source === '易遊網');
      const settour = data.filter(t => t.source === '東南旅遊');

      // 獲取最後一次爬取記錄
      const { data: logData } = await this.supabase
        .from('tours_scrape_log')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(1);

      const lastScrape = logData && logData[0] ? logData[0].scraped_at : new Date().toISOString();

      console.log(`✅ 從資料庫讀取到 ${data.length} 個行程 (易遊網: ${eztravel.length}, 東南旅遊: ${settour.length})`);

      return {
        success: true,
        eztravel,
        settour,
        totalCount: data.length,
        scrapedAt: lastScrape,
        fromCache: true
      };
    } catch (error) {
      console.error('從資料庫讀取行程失敗:', error);
      return null;
    }
  }

  /**
   * 將行程資料存入 Supabase
   */
  async saveToursToDatabase(tours, totalCount) {
    try {
      console.log('💾 將行程資料存入資料庫...');

      // 先清空舊資料
      const { error: deleteError } = await this.supabase
        .from('popular_tours')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 刪除所有資料

      if (deleteError) {
        console.error('清空舊資料失敗:', deleteError);
      }

      // 插入新資料
      const allTours = [
        ...(tours.eztravel || []).map(tour => ({ ...tour, source: '易遊網' })),
        ...(tours.settour || []).map(tour => ({ ...tour, source: '東南旅遊' }))
      ];

      if (allTours.length > 0) {
        const { error: insertError } = await this.supabase
          .from('popular_tours')
          .insert(allTours);

        if (insertError) {
          console.error('插入新資料失敗:', insertError);
          throw insertError;
        }
      }

      // 記錄爬取日誌
      const { error: logError } = await this.supabase
        .from('tours_scrape_log')
        .insert({
          total_count: totalCount,
          eztravel_count: tours.eztravel?.length || 0,
          settour_count: tours.settour?.length || 0
        });

      if (logError) {
        console.error('記錄爬取日誌失敗:', logError);
      }

      console.log(`✅ 成功存入 ${allTours.length} 個行程到資料庫`);
    } catch (error) {
      console.error('存入資料庫失敗:', error);
      // 不拋出錯誤，即使存入失敗也返回爬取結果
    }
  }

  /**
   * 爬取多個旅遊網站並用 ChatGPT 分別整理熱門行程（並行處理）
   * @param {boolean} forceRefresh - 是否強制重新爬取（true: 重新爬取, false: 優先從資料庫讀取）
   */
  async fetchAndOrganizePopularTours(forceRefresh = false) {
    try {
      // 如果不強制刷新，先嘗試從資料庫讀取
      if (!forceRefresh) {
        const cachedData = await this.getToursFromDatabase();
        if (cachedData) {
          console.log('✅ 使用資料庫快取資料');
          return cachedData;
        }
        console.log('⚠️  資料庫無快取，開始爬取...');
      } else {
        console.log('🔄 強制重新爬取...');
      }

      const startTime = Date.now();
      console.log('🚀 開始並行爬取旅遊網站...');

      // 爬取多個網站
      const websites = [
        { name: '易遊網', key: 'eztravel', url: 'https://www.eztravel.com.tw' },
        { name: '東南旅遊', key: 'settour', url: 'https://www.settour.com.tw/' }
      ];

      // 🚀 並行爬取所有網站
      const scrapePromises = websites.map(async (site) => {
        try {
          console.log(`🕷️ 開始爬取 ${site.name}...`);
          const startScrape = Date.now();

          const data = await this.scrapeProductUrl(site.url);
          const scrapeTime = ((Date.now() - startScrape) / 1000).toFixed(1);

          console.log(`✅ ${site.name} 爬取成功 (${data.content.length} 字, 耗時 ${scrapeTime}s)`);

          return { site, data, success: true };
        } catch (error) {
          console.error(`❌ ${site.name} 爬取失敗:`, error.message);
          return { site, data: null, success: false };
        }
      });

      const scrapeResults = await Promise.all(scrapePromises);
      const scrapeTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n⚡ 爬取階段完成，耗時 ${scrapeTime}s (並行處理)\n`);

      // 🚀 並行整理所有網站的行程
      console.log('🤖 開始並行使用 ChatGPT 整理行程...');
      const organizePromises = scrapeResults.map(async ({ site, data, success }) => {
        if (!success || !data) {
          console.log(`⚠️  ${site.name} 無數據，跳過整理`);
          return { key: site.key, tours: [] };
        }

        try {
          console.log(`🤖 整理 ${site.name} 的 30 個熱門行程...`);
          const startOrganize = Date.now();

          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: '你是一位專業的旅遊顧問，擅長從旅遊網站內容中提取並整理熱門旅遊行程資訊。'
              },
              {
                role: 'user',
                content: `請從以下 ${site.name} 網站的內容中，提取並整理出 30 個最熱門的旅遊行程。

網站內容：
${data.content.substring(0, 8000)}

請以 JSON 格式回傳，格式如下：
{
  "tours": [
    {
      "name": "行程名稱",
      "destination": "目的地（國家/城市）",
      "type": "行程類型（如：跟團、自由行、機加酒等）",
      "highlights": "行程亮點（簡短描述）",
      "price": "價格範圍（如果有的話）"
    }
  ]
}

要求：
1. 精選 30 個最熱門的行程
2. 盡量涵蓋不同目的地和類型
3. 包含日本、韓國、東南亞、歐洲等熱門地區
4. 行程亮點要簡潔有力（30字以內）
5. 如果文中有提到價格，請一併列出
6. 優先選擇有價格標示的行程`
              }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
          });

          const result = JSON.parse(completion.choices[0].message.content);
          const organizeTime = ((Date.now() - startOrganize) / 1000).toFixed(1);

          console.log(`✅ ${site.name} 成功整理出 ${result.tours?.length || 0} 個行程 (耗時 ${organizeTime}s)`);

          return { key: site.key, tours: result.tours || [] };
        } catch (error) {
          console.error(`❌ ${site.name} 整理失敗:`, error.message);
          return { key: site.key, tours: [] };
        }
      });

      const organizeResults = await Promise.all(organizePromises);

      // 整理結果
      const allTours = {};
      organizeResults.forEach(({ key, tours }) => {
        allTours[key] = tours;
      });

      const eztravelCount = allTours.eztravel?.length || 0;
      const settourCount = allTours.settour?.length || 0;
      const totalCount = eztravelCount + settourCount;
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`\n⚡ 總耗時: ${totalTime}s (並行處理)`);
      console.log(`✅ 總共成功整理出 ${totalCount} 個熱門行程`);
      console.log(`   - 易遊網: ${eztravelCount} 個`);
      console.log(`   - 東南旅遊: ${settourCount} 個`);

      // 存入資料庫
      await this.saveToursToDatabase(allTours, totalCount);

      return {
        success: true,
        eztravel: allTours.eztravel || [],
        settour: allTours.settour || [],
        totalCount,
        scrapedAt: new Date().toISOString(),
        fromCache: false,
        performance: {
          totalTime: `${totalTime}s`,
          scrapeTime: `${scrapeTime}s`,
          parallel: true
        }
      };

    } catch (error) {
      console.error('爬取並整理熱門行程失敗:', error);
      throw new Error('爬取並整理熱門行程失敗: ' + error.message);
    }
  }
}

export default new ProductLocationStoryService();
