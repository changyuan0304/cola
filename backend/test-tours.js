import 'dotenv/config';
import ProductLocationStoryService from './services/ProductLocationStoryService.js';
import fs from 'fs';

(async () => {
  try {
    console.log('🚀 開始爬取熱門行程...\n');

    const result = await ProductLocationStoryService.fetchAndOrganizePopularTours();

    console.log('\n\n📊 爬取結果統計:');
    console.log(`✅ 總共: ${result.totalCount} 個行程`);
    console.log(`   - 易遊網 (eztravel): ${result.eztravel?.length || 0} 個`);
    console.log(`   - 東南旅遊 (settour): ${result.settour?.length || 0} 個`);
    console.log(`\n📅 爬取時間: ${result.scrapedAt}`);

    // 儲存結果到檔案
    const outputPath = '/tmp/tours_result_full.json';
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n💾 結果已儲存到: ${outputPath}`);

    // 顯示前 5 個行程
    console.log('\n\n📋 易遊網前 5 個行程:');
    result.eztravel?.slice(0, 5).forEach((tour, i) => {
      console.log(`\n${i + 1}. ${tour.name}`);
      console.log(`   目的地: ${tour.destination}`);
      console.log(`   類型: ${tour.type}`);
      console.log(`   亮點: ${tour.highlights}`);
      if (tour.price) console.log(`   價格: ${tour.price}`);
    });

    console.log('\n\n📋 東南旅遊前 5 個行程:');
    result.settour?.slice(0, 5).forEach((tour, i) => {
      console.log(`\n${i + 1}. ${tour.name}`);
      console.log(`   目的地: ${tour.destination}`);
      console.log(`   類型: ${tour.type}`);
      console.log(`   亮點: ${tour.highlights}`);
      if (tour.price) console.log(`   價格: ${tour.price}`);
    });

  } catch (error) {
    console.error('\n❌ 錯誤:', error.message);
    console.error(error);
  }
})();
