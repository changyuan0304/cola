import ProductLocationStoryService from '../services/ProductLocationStoryService.js';

async function testToursCache() {
  console.log('🧪 開始測試熱門行程快取功能\n');
  console.log('=' .repeat(80));

  try {
    // 測試 1: 檢查資料庫連接
    console.log('\n📊 測試 1: 檢查資料庫連接');
    console.log('-'.repeat(80));

    const cachedData = await ProductLocationStoryService.getToursFromDatabase();

    if (cachedData && cachedData.fromCache) {
      console.log('✅ 資料庫連接正常');
      console.log(`   找到 ${cachedData.totalCount} 個快取行程`);
      console.log(`   - 易遊網: ${cachedData.eztravel?.length || 0} 個`);
      console.log(`   - 東南旅遊: ${cachedData.settour?.length || 0} 個`);
      console.log(`   - 最後爬取時間: ${cachedData.scrapedAt}`);
    } else {
      console.log('ℹ️  資料庫中尚無快取資料');
    }

    // 測試 2: 讀取快取（不強制刷新）
    console.log('\n📖 測試 2: 讀取行程（優先使用快取）');
    console.log('-'.repeat(80));

    const result1 = await ProductLocationStoryService.fetchAndOrganizePopularTours(false);

    if (result1.success) {
      console.log('✅ 讀取成功');
      console.log(`   來源: ${result1.fromCache ? '資料庫快取' : '重新爬取'}`);
      console.log(`   總數: ${result1.totalCount} 個行程`);

      if (result1.performance) {
        console.log(`   耗時: ${result1.performance.totalTime}`);
      }
    } else {
      console.log('❌ 讀取失敗');
    }

    // 測試 3: 強制重新爬取
    console.log('\n🔄 測試 3: 強制重新爬取（會覆蓋資料庫）');
    console.log('-'.repeat(80));
    console.log('⚠️  這個操作會花費約 60 秒...\n');

    const result2 = await ProductLocationStoryService.fetchAndOrganizePopularTours(true);

    if (result2.success) {
      console.log('✅ 爬取成功');
      console.log(`   來源: ${result2.fromCache ? '資料庫快取' : '重新爬取'}`);
      console.log(`   總數: ${result2.totalCount} 個行程`);
      console.log(`   - 易遊網: ${result2.eztravel?.length || 0} 個`);
      console.log(`   - 東南旅遊: ${result2.settour?.length || 0} 個`);

      if (result2.performance) {
        console.log(`   爬取耗時: ${result2.performance.scrapeTime}`);
        console.log(`   總耗時: ${result2.performance.totalTime}`);
      }
    } else {
      console.log('❌ 爬取失敗');
    }

    // 測試 4: 再次讀取快取（驗證是否成功儲存）
    console.log('\n📖 測試 4: 再次讀取快取（驗證儲存）');
    console.log('-'.repeat(80));

    const result3 = await ProductLocationStoryService.fetchAndOrganizePopularTours(false);

    if (result3.success) {
      console.log('✅ 讀取成功');
      console.log(`   來源: ${result3.fromCache ? '資料庫快取' : '重新爬取'}`);
      console.log(`   總數: ${result3.totalCount} 個行程`);

      if (result3.fromCache) {
        console.log('   ✅ 快取功能正常運作！');
      } else {
        console.log('   ⚠️  未使用快取，可能儲存失敗');
      }
    } else {
      console.log('❌ 讀取失敗');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 測試完成！');

  } catch (error) {
    console.error('\n❌ 測試過程中發生錯誤:');
    console.error(error);
    process.exit(1);
  }
}

// 執行測試
testToursCache();
