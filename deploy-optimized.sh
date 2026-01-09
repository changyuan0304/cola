#!/bin/bash

echo "🚀 部署優化版本到 GCP Cloud Run"
echo ""

PROJECT_ID="gen-lang-client-0414687610"
REGION="asia-east1"

echo "📦 專案: $PROJECT_ID"
echo "🌏 區域: $REGION"
echo ""

# 設定專案
gcloud config set project $PROJECT_ID

# 部署後端（增加記憶體到 1GB，CPU 到 2）
echo "🚀 部署後端（優化配置：1GB RAM + 2 CPU）..."
echo ""

cd backend

gcloud builds submit --tag asia-east1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/cola-backend

gcloud run deploy cola-backend \
    --image asia-east1-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/cola-backend \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 4001 \
    --memory 1Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "NODE_ENV=production" \
    --set-secrets "OPENAI_API_KEY=openai-key:latest,GOOGLE_MAPS_API_KEY=google-maps-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest"

BACKEND_URL=$(gcloud run services describe cola-backend --region $REGION --format 'value(status.url)')

echo ""
echo "✅ 後端部署完成！"
echo "🔗 後端網址: $BACKEND_URL"
echo ""
echo "配置詳情："
echo "  - 記憶體: 1GB (提升 2x)"
echo "  - CPU: 2 核心 (提升 2x)"
echo "  - 超時: 300 秒"
echo "  - 並發: 80 請求"
echo ""
echo "========================================="
echo "🎉 部署完成！"
echo "========================================="
echo ""
echo "📝 測試優化後的性能："
echo "time curl -X POST $BACKEND_URL/api/product-location-story/fetch-popular-tours -H 'Content-Type: application/json'"
echo ""

cd ..
