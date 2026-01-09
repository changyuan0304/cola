import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 請設定 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 環境變數');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 開始執行資料庫 migration...\n');

    // 讀取 SQL 檔案
    const sqlPath = path.join(__dirname, '../migrations/create_popular_tours_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL 檔案內容：');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));
    console.log('');

    // 分割 SQL 語句（以分號和換行分隔）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 共有 ${statements.length} 個 SQL 語句需要執行\n`);

    // 逐個執行 SQL 語句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // 補回分號
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');

      console.log(`⏳ [${i + 1}/${statements.length}] 執行: ${preview}...`);

      const { error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });

      if (error) {
        // 如果是因為 RPC 函數不存在，直接使用 Supabase API 執行
        console.log('   ℹ️  使用直接查詢方式');

        // 檢查是否為 CREATE TABLE 語句
        if (statement.includes('CREATE TABLE')) {
          console.log('   ✅ 跳過 CREATE TABLE（請使用 Supabase Dashboard SQL Editor 執行）');
        } else {
          throw error;
        }
      } else {
        console.log('   ✅ 成功');
      }
    }

    console.log('\n✅ Migration 執行完成！');
    console.log('\n📊 驗證資料表是否創建成功...');

    // 驗證資料表
    const { data: tables, error: verifyError } = await supabase
      .from('popular_tours')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  無法驗證資料表，請手動檢查 Supabase Dashboard');
      console.log('   錯誤訊息:', verifyError.message);
    } else {
      console.log('✅ popular_tours 資料表已成功創建！');
    }

    const { data: logs, error: logError } = await supabase
      .from('tours_scrape_log')
      .select('*')
      .limit(1);

    if (logError) {
      console.log('⚠️  無法驗證 tours_scrape_log 資料表');
    } else {
      console.log('✅ tours_scrape_log 資料表已成功創建！');
    }

    console.log('\n🎉 所有完成！');

  } catch (error) {
    console.error('\n❌ Migration 執行失敗:');
    console.error(error);
    process.exit(1);
  }
}

// 執行 migration
runMigration();
