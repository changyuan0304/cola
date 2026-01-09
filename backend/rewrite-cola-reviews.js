import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser';
import ProductLocationStoryService from './services/ProductLocationStoryService.js';

const CSV_PATH = '/Users/yu-an/Downloads/threads_posts_20260104T170249.csv';
const OUTPUT_PATH = '/tmp/cola_reviews_rewritten.json';
const BATCH_SIZE = 10; // 每次處理 10 篇
const MAX_POSTS = 50; // 先處理前 50 篇測試

(async () => {
  try {
    console.log('🚀 開始批量改寫可樂旅遊口碑文...\n');

    // 讀取 CSV
    console.log('📂 讀取 CSV 檔案...');
    const posts = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => {
          if (row['貼文內容'] && row['貼文內容'].trim()) {
            posts.push({
              序號: row['序號'],
              用戶名: row['用戶名'],
              原始內容: row['貼文內容'],
              讚數: row['讚數'],
              回覆數: row['回覆數']
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`✅ 成功讀取 ${posts.length} 篇貼文\n`);

    // 限制處理數量（測試用）
    const postsToProcess = posts.slice(0, MAX_POSTS);
    console.log(`📝 將處理前 ${postsToProcess.length} 篇貼文\n`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // 批量處理
    for (let i = 0; i < postsToProcess.length; i += BATCH_SIZE) {
      const batch = postsToProcess.slice(i, i + BATCH_SIZE);
      console.log(`\n🔄 處理第 ${i + 1} - ${Math.min(i + BATCH_SIZE, postsToProcess.length)} 篇...`);

      for (const post of batch) {
        try {
          console.log(`\n  📝 [${post.序號}] 正在改寫...`);
          console.log(`     原文: ${post.原始內容.substring(0, 50)}...`);

          // 使用「純文字討論」模式生成口碑文
          const rewrittenContent = await ProductLocationStoryService.generateContent({
            productName: '可樂旅遊經驗分享',
            productInfo: post.原始內容,
            characterSetting: '200-300字，真實口吻，推薦可樂旅遊',
            contentType: 'discussion'
          });

          // 提取地點
          const locations = await ProductLocationStoryService.extractLocations(rewrittenContent);

          // 儲存到 Supabase
          const savedArticle = await ProductLocationStoryService.saveArticle({
            userId: 'cola-review-bot',
            contentType: 'discussion',
            content: rewrittenContent,
            formData: {
              originalPost: post.原始內容,
              userName: post.用戶名,
              序號: post.序號,
              讚數: post.讚數
            },
            locations: locations.slice(0, 5),
            images: []
          });

          results.push({
            序號: post.序號,
            用戶名: post.用戶名,
            原始內容: post.原始內容,
            改寫內容: rewrittenContent,
            地點數量: locations.length,
            文章ID: savedArticle.id,
            狀態: 'success'
          });

          successCount++;
          console.log(`     ✅ 成功！文章 ID: ${savedArticle.id}`);
          console.log(`     改寫: ${rewrittenContent.substring(0, 60)}...`);

        } catch (error) {
          console.error(`     ❌ 失敗: ${error.message}`);
          results.push({
            序號: post.序號,
            原始內容: post.原始內容,
            錯誤: error.message,
            狀態: 'failed'
          });
          failCount++;
        }

        // 延遲避免 API rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`\n  📊 批次完成: 成功 ${successCount} / 失敗 ${failCount}`);

      // 每批次間延遲
      if (i + BATCH_SIZE < postsToProcess.length) {
        console.log('  ⏳ 等待 3 秒後繼續...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // 儲存結果到 JSON
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n\n💾 結果已儲存到: ${OUTPUT_PATH}`);

    // 統計
    console.log('\n\n📊 最終統計:');
    console.log(`✅ 成功: ${successCount} 篇`);
    console.log(`❌ 失敗: ${failCount} 篇`);
    console.log(`📈 成功率: ${((successCount / postsToProcess.length) * 100).toFixed(1)}%`);

    // 顯示前 3 個成功的範例
    const successResults = results.filter(r => r.狀態 === 'success').slice(0, 3);
    if (successResults.length > 0) {
      console.log('\n\n📋 改寫範例 (前 3 篇):');
      successResults.forEach((result, i) => {
        console.log(`\n${i + 1}. [序號 ${result.序號}]`);
        console.log(`   原文: ${result.原始內容.substring(0, 80)}...`);
        console.log(`   改寫: ${result.改寫內容.substring(0, 80)}...`);
        console.log(`   地點: ${result.地點數量} 個 | 文章 ID: ${result.文章ID}`);
      });
    }

    console.log('\n\n🎉 批量改寫完成！');

  } catch (error) {
    console.error('\n❌ 執行失敗:', error);
    process.exit(1);
  }
})();
