#!/bin/bash

echo "🚀 商品地點故事生成器 - 快速啟動腳本"
echo "========================================"
echo ""

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    echo "請先安裝 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 檢查後端環境變數
if [ ! -f "backend/.env" ]; then
    echo "⚠️  警告：未找到 backend/.env 檔案"
    echo "請複製 backend/.env.example 並填入 API Keys"
    echo ""
    echo "執行以下指令："
    echo "  cd backend"
    echo "  cp .env.example .env"
    echo "  # 然後編輯 .env 檔案填入實際的 API Keys"
    echo ""
    exit 1
fi

# 檢查前端環境變數
if [ ! -f "frontend/.env" ]; then
    echo "📝 創建前端環境變數檔案..."
    cd frontend
    cp .env.example .env
    cd ..
fi

# 啟動後端
echo "🔧 啟動後端服務 (Port 4001)..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

# 啟動前端
echo "🎨 啟動前端服務 (Port 4000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服務已啟動！"
echo ""
echo "📍 前端地址: http://localhost:4000"
echo "📍 後端地址: http://localhost:4001"
echo "🏥 健康檢查: http://localhost:4001/api/health"
echo ""
echo "按 Ctrl+C 停止所有服務"

# 等待
wait $BACKEND_PID $FRONTEND_PID
