#!/bin/bash

echo "🌐 開始部署到 Google Cloud Run"
echo ""

# 設定專案
PROJECT_ID="gen-lang-client-0414687610"
REGION="asia-east1"

echo "📋 專案 ID: $PROJECT_ID"
echo "🌏 區域: $REGION"
echo ""

# 重新登入
echo "🔑 步驟 1: 重新登入 GCP..."
gcloud auth login

# 設定專案
echo ""
echo "🔧 步驟 2: 設定專案..."
gcloud config set project $PROJECT_ID

# 啟用 API
echo ""
echo "🔌 步驟 3: 啟用必要的 API..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com

echo ""
echo "✅ API 已啟用"

# 設定 Secrets
echo ""
echo "🔐 步驟 4: 設定 Secret Manager..."
echo ""

# 檢查 secrets 是否已存在
if gcloud secrets describe openai-key &>/dev/null; then
    echo "⚠️  Secrets 已存在，使用現有的 secrets"
else
    echo "請輸入以下 API Keys："
    echo ""

    # OpenAI
    read -p "OpenAI API Key: " OPENAI_KEY
    echo -n "$OPENAI_KEY" | gcloud secrets create openai-key --data-file=-

    # Google Maps
    read -p "Google Maps API Key: " GMAPS_KEY
    echo -n "$GMAPS_KEY" | gcloud secrets create google-maps-key --data-file=-

    # Supabase URL
    read -p "Supabase URL: " SUPABASE_URL
    echo -n "$SUPABASE_URL" | gcloud secrets create supabase-url --data-file=-

    # Supabase Key
    read -p "Supabase Key: " SUPABASE_KEY
    echo -n "$SUPABASE_KEY" | gcloud secrets create supabase-key --data-file=-

    echo ""
    echo "✅ Secrets 已建立"
fi

# 授權
echo ""
echo "🔓 步驟 5: 設定權限..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in openai-key google-maps-key supabase-url supabase-key; do
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet 2>/dev/null || true
done

echo "✅ 權限已設定"

# 部署後端
echo ""
echo "========================================="
echo "🚀 步驟 6: 部署後端..."
echo "========================================="
echo ""

cd backend

gcloud builds submit --tag gcr.io/$PROJECT_ID/cola-backend

gcloud run deploy cola-backend \
    --image gcr.io/$PROJECT_ID/cola-backend \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 4001 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,PORT=4001" \
    --set-secrets "OPENAI_API_KEY=openai-key:latest,GOOGLE_MAPS_API_KEY=google-maps-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest"

BACKEND_URL=$(gcloud run services describe cola-backend --region $REGION --format 'value(status.url)')

echo ""
echo "✅ 後端部署完成！"
echo "🔗 後端網址: $BACKEND_URL"

# 部署前端
echo ""
echo "========================================="
echo "🚀 步驟 7: 部署前端..."
echo "========================================="
echo ""

cd ../frontend

gcloud builds submit --tag gcr.io/$PROJECT_ID/cola-frontend \
    --build-arg REACT_APP_API_URL=$BACKEND_URL

gcloud run deploy cola-frontend \
    --image gcr.io/$PROJECT_ID/cola-frontend \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5

FRONTEND_URL=$(gcloud run services describe cola-frontend --region $REGION --format 'value(status.url)')

echo ""
echo "✅ 前端部署完成！"
echo "🔗 前端網址: $FRONTEND_URL"

# 完成
echo ""
echo "========================================="
echo "🎉 部署全部完成！"
echo "========================================="
echo ""
echo "📋 部署資訊："
echo ""
echo "後端 API: $BACKEND_URL"
echo "前端網站: $FRONTEND_URL"
echo ""
echo "========================================="
echo ""
echo "📝 測試部署："
echo ""
echo "# 測試後端"
echo "curl $BACKEND_URL/api/health"
echo ""
echo "# 開啟前端"
echo "open $FRONTEND_URL"
echo ""
echo "========================================="

cd ..
