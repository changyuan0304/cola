import 'dotenv/config';
import ProductLocationStoryService from './services/ProductLocationStoryService.js';

(async () => {
  try {
    console.log('🧪 測試文章生成功能...\n');

    // 測試 1: 生成文案
    console.log('📝 步驟 1: 生成文案...');
    const content = await ProductLocationStoryService.generateContent({
      productName: '測試旅遊行程',
      productInfo: '這是一個測試行程，包含台北 101、日月潭、阿里山等知名景點。',
      productFeatures: '包含住宿、交通、導遊服務',
      characterSetting: '200-250',
      contentType: 'product'
    });

    console.log('✅ 文案生成成功！');
    console.log('\n--- 生成的文案 ---');
    console.log(content);
    console.log('--- 文案結束 ---\n');

    // 測試 2: 提取地點
    console.log('\n📍 步驟 2: 提取地點...');
    const locations = await ProductLocationStoryService.extractLocations(content);
    console.log('✅ 提取到', locations.length, '個地點:');
    locations.forEach((loc, i) => {
      console.log(`  ${i + 1}. ${loc}`);
    });

    // 測試 3: 儲存文章
    console.log('\n💾 步驟 3: 儲存文章到 Supabase...');
    const savedArticle = await ProductLocationStoryService.saveArticle({
      userId: 'test-user',
      contentType: 'product',
      content: content,
      formData: {
        productName: '測試旅遊行程',
        productInfo: '這是一個測試行程'
      },
      locations: locations,
      images: []
    });

    console.log('✅ 文章已儲存！');
    console.log('   文章 ID:', savedArticle.id);
    console.log('   建立時間:', savedArticle.created_at);

    console.log('\n\n🎉 所有測試通過！系統運作正常。');

  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message);
    console.error('\n錯誤詳情:');
    console.error(error);
    process.exit(1);
  }
})();
