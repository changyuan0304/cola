#!/bin/bash

echo "🚂 Railway 部署準備腳本"
echo ""

# 檢查是否安裝 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安裝"
    echo "📦 正在安裝 Railway CLI..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI 已安裝"
echo ""

# 初始化 Git（如果尚未初始化）
if [ ! -d ".git" ]; then
    echo "📂 初始化 Git repository..."
    git init
    git add .
    git commit -m "Initial commit for Railway deployment"
    echo "✅ Git repository 已初始化"
else
    echo "✅ Git repository 已存在"
fi

echo ""
echo "🔑 接下來的步驟："
echo ""
echo "1️⃣  登入 Railway:"
echo "   railway login"
echo ""
echo "2️⃣  初始化專案:"
echo "   railway init"
echo ""
echo "3️⃣  部署後端:"
echo "   cd backend"
echo "   railway up"
echo "   railway variables set OPENAI_API_KEY='你的OpenAI金鑰'"
echo "   railway variables set GOOGLE_MAPS_API_KEY='你的GoogleMaps金鑰'"
echo "   railway variables set SUPABASE_URL='你的Supabase網址'"
echo "   railway variables set SUPABASE_KEY='你的Supabase金鑰'"
echo ""
echo "4️⃣  部署前端:"
echo "   cd ../frontend"
echo "   railway up"
echo "   railway variables set REACT_APP_API_URL='https://你的後端網址.railway.app'"
echo ""
echo "📚 完整文檔請查看: DEPLOY.md"
echo ""
