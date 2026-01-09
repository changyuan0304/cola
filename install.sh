#!/bin/bash

echo "📦 商品地點故事生成器 - 安裝腳本"
echo "========================================"
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    echo "請先安裝 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 安裝後端依賴
echo "📦 安裝後端依賴..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 後端依賴安裝失敗"
    exit 1
fi
echo "✅ 後端依賴安裝完成"
cd ..
echo ""

# 安裝前端依賴
echo "📦 安裝前端依賴..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依賴安裝失敗"
    exit 1
fi
echo "✅ 前端依賴安裝完成"
cd ..
echo ""

# 創建環境變數檔案
if [ ! -f "backend/.env" ]; then
    echo "📝 創建後端環境變數檔案..."
    cd backend
    cp .env.example .env
    cd ..
    echo "⚠️  請編輯 backend/.env 並填入實際的 API Keys"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 創建前端環境變數檔案..."
    cd frontend
    cp .env.example .env
    cd ..
fi

echo ""
echo "✅ 安裝完成！"
echo ""
echo "📋 下一步："
echo "1. 編輯 backend/.env 填入 API Keys："
echo "   - OPENAI_API_KEY"
echo "   - GOOGLE_MAPS_API_KEY"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_KEY"
echo ""
echo "2. 在 Supabase 創建 Storage Bucket："
echo "   - Bucket 名稱: product-location-images"
echo "   - 設定為 Public bucket"
echo ""
echo "3. 啟動服務："
echo "   ./start.sh"
echo ""
echo "或手動啟動："
echo "   cd backend && npm start"
echo "   cd frontend && npm start"
echo ""
