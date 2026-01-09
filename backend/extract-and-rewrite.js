import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser';
import ProductLocationStoryService from './services/ProductLocationStoryService.js';

const CSV_PATH = '/Users/yu-an/Downloads/threads_posts_20260104T170249.csv';
const EXTRACT_COUNT = 10; // 抽取 10 篇

(async () => {
  try {
    console.log('🎲 從 CSV 抽取貼文並改寫成可樂旅遊口碑文...\n');

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
              內容: row['貼文內容'],
              讚數: row['讚數'],
              回覆數: row['回覆數']
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`✅ 讀取到 ${posts.length} 篇貼文`);

    // 隨機抽取
    const shuffled = posts.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, EXTRACT_COUNT);

    console.log(`\n🎯 隨機抽取 ${selected.length} 篇進行改寫\n`);
    console.log('=' .repeat(60));

    // 逐一改寫
    for (let i = 0; i < selected.length; i++) {
      const post = selected[i];

      console.log(`\n📝 [${i + 1}/${selected.length}] 改寫中...`);
      console.log(`原作者: @${post.用戶名}`);
      console.log(`互動: ❤️ ${post.讚數} 💬 ${post.回覆數}`);
      console.log('\n--- 原始內容 ---');
      console.log(post.內容);
      console.log('--- 原始內容結束 ---\n');

      try {
        // 使用「純文字討論」模式改寫
        const rewritten = await ProductLocationStoryService.generateContent({
          productName: '可樂旅遊真實體驗分享',
          productInfo: post.內容,
          characterSetting: '200-300字，自然真實的口吻，推薦可樂旅遊',
          contentType: 'discussion'
        });

        console.log('--- 改寫後內容 ---');
        console.log(rewritten);
        console.log('--- 改寫結束 ---\n');

        // 提取地點
        const locations = await ProductLocationStoryService.extractLocations(rewritten);
        console.log(`📍 提取到 ${locations.length} 個地點`);
        if (locations.length > 0) {
          console.log(`   範例: ${locations.slice(0, 3).join(', ')}`);
        }

        console.log('✅ 完成！\n');
        console.log('=' .repeat(60));

        // 延遲避免 API rate limit
        if (i < selected.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ 改寫失敗: ${error.message}\n`);
        console.log('=' .repeat(60));
      }
    }

    console.log('\n\n🎉 所有抽取的貼文改寫完成！');

  } catch (error) {
    console.error('\n❌ 執行失敗:', error);
    process.exit(1);
  }
})();
