#!/bin/bash

echo "🌐 GCP Cloud Run 部署腳本"
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查 gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI 未安裝${NC}"
    echo "請執行：brew install google-cloud-sdk"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI 已安裝${NC}"
echo ""

# 獲取專案 ID
echo "📋 請輸入您的 GCP 專案 ID："
read -p "專案 ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ 專案 ID 不能為空${NC}"
    exit 1
fi

# 設定專案
echo ""
echo "🔧 設定 GCP 專案..."
gcloud config set project $PROJECT_ID

# 啟用必要的 API
echo ""
echo "🔌 啟用必要的 API..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com

echo ""
echo -e "${GREEN}✅ API 已啟用${NC}"

# 設定 Secrets
echo ""
echo "🔐 設定 Secret Manager..."
echo ""
echo "請輸入以下 API keys（將安全儲存在 Secret Manager）："
echo ""

# OpenAI API Key
read -p "OpenAI API Key: " OPENAI_KEY
if [ -n "$OPENAI_KEY" ]; then
    echo -n "$OPENAI_KEY" | gcloud secrets create openai-key --data-file=- 2>/dev/null || \
    echo -n "$OPENAI_KEY" | gcloud secrets versions add openai-key --data-file=-
    echo -e "${GREEN}✅ OpenAI key 已設定${NC}"
fi

# Google Maps API Key
read -p "Google Maps API Key: " GMAPS_KEY
if [ -n "$GMAPS_KEY" ]; then
    echo -n "$GMAPS_KEY" | gcloud secrets create google-maps-key --data-file=- 2>/dev/null || \
    echo -n "$GMAPS_KEY" | gcloud secrets versions add google-maps-key --data-file=-
    echo -e "${GREEN}✅ Google Maps key 已設定${NC}"
fi

# Supabase URL
read -p "Supabase URL: " SUPABASE_URL
if [ -n "$SUPABASE_URL" ]; then
    echo -n "$SUPABASE_URL" | gcloud secrets create supabase-url --data-file=- 2>/dev/null || \
    echo -n "$SUPABASE_URL" | gcloud secrets versions add supabase-url --data-file=-
    echo -e "${GREEN}✅ Supabase URL 已設定${NC}"
fi

# Supabase Key
read -p "Supabase Key: " SUPABASE_KEY
if [ -n "$SUPABASE_KEY" ]; then
    echo -n "$SUPABASE_KEY" | gcloud secrets create supabase-key --data-file=- 2>/dev/null || \
    echo -n "$SUPABASE_KEY" | gcloud secrets versions add supabase-key --data-file=-
    echo -e "${GREEN}✅ Supabase key 已設定${NC}"
fi

# 授權 Cloud Run 存取 secrets
echo ""
echo "🔓 授權 Cloud Run 存取 secrets..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in openai-key google-maps-key supabase-url supabase-key; do
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet 2>/dev/null
done

echo -e "${GREEN}✅ 權限已設定${NC}"

# 部署後端
echo ""
echo "🚀 部署後端..."
echo ""

cd backend

# 建置並推送容器映像
gcloud builds submit --tag gcr.io/$PROJECT_ID/cola-backend

# 部署到 Cloud Run
gcloud run deploy cola-backend \
    --image gcr.io/$PROJECT_ID/cola-backend \
    --platform managed \
    --region asia-east1 \
    --allow-unauthenticated \
    --port 4001 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,PORT=4001" \
    --set-secrets "OPENAI_API_KEY=openai-key:latest,GOOGLE_MAPS_API_KEY=google-maps-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest"

# 獲取後端網址
BACKEND_URL=$(gcloud run services describe cola-backend --region asia-east1 --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ 後端部署完成${NC}"
echo -e "後端網址: ${YELLOW}$BACKEND_URL${NC}"

# 部署前端
echo ""
echo "🚀 部署前端..."
echo ""

cd ../frontend

# 建置並推送容器映像（使用後端網址）
gcloud builds submit --tag gcr.io/$PROJECT_ID/cola-frontend \
    --build-arg REACT_APP_API_URL=$BACKEND_URL

# 部署到 Cloud Run
gcloud run deploy cola-frontend \
    --image gcr.io/$PROJECT_ID/cola-frontend \
    --platform managed \
    --region asia-east1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5

# 獲取前端網址
FRONTEND_URL=$(gcloud run services describe cola-frontend --region asia-east1 --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ 前端部署完成${NC}"
echo -e "前端網址: ${YELLOW}$FRONTEND_URL${NC}"

# 完成
echo ""
echo "========================================="
echo -e "${GREEN}🎉 部署全部完成！${NC}"
echo "========================================="
echo ""
echo "🔗 網址資訊："
echo ""
echo -e "後端 API: ${YELLOW}$BACKEND_URL${NC}"
echo -e "前端網站: ${YELLOW}$FRONTEND_URL${NC}"
echo ""
echo "========================================="
echo ""
echo "📝 測試部署："
echo ""
echo "# 測試後端健康檢查"
echo "curl $BACKEND_URL/api/health"
echo ""
echo "# 訪問前端"
echo "open $FRONTEND_URL"
echo ""
echo "========================================="
