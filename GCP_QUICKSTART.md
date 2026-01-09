# 🚀 GCP Cloud Run 快速部署（10分鐘）

## 📋 前置需求

1. **GCP 帳號**：訪問 https://console.cloud.google.com/
2. **啟用計費**：需要信用卡（有 $300 免費額度）
3. **安裝 gcloud CLI**：
   ```bash
   brew install google-cloud-sdk
   ```

---

## 🎯 方法 1：一鍵部署腳本（最簡單）

```bash
cd /Users/yu-an/Desktop/product-location-story

# 登入 GCP
gcloud auth login

# 執行部署腳本
./deploy-gcp.sh
```

腳本會詢問：
- **GCP 專案 ID**
- **OpenAI API Key**
- **Google Maps API Key**
- **Supabase URL**
- **Supabase Key**

然後自動完成所有部署！ 🎉

---

## 🎯 方法 2：手動部署（進階）

### Step 1: 設定專案

```bash
# 登入
gcloud auth login

# 設定專案 ID
gcloud config set project 你的專案ID

# 啟用 API
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 2: 設定 Secrets

```bash
# OpenAI
echo -n "你的OpenAI金鑰" | gcloud secrets create openai-key --data-file=-

# Google Maps
echo -n "你的GoogleMaps金鑰" | gcloud secrets create google-maps-key --data-file=-

# Supabase
echo -n "你的Supabase網址" | gcloud secrets create supabase-url --data-file=-
echo -n "你的Supabase金鑰" | gcloud secrets create supabase-key --data-file=-

# 授權存取
PROJECT_NUMBER=$(gcloud projects describe 你的專案ID --format='value(projectNumber)')
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in openai-key google-maps-key supabase-url supabase-key; do
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor"
done
```

### Step 3: 部署後端

```bash
cd backend

# 建置並部署
gcloud builds submit --tag gcr.io/你的專案ID/cola-backend

gcloud run deploy cola-backend \
    --image gcr.io/你的專案ID/cola-backend \
    --platform managed \
    --region asia-east1 \
    --allow-unauthenticated \
    --port 4001 \
    --set-env-vars "NODE_ENV=production,PORT=4001" \
    --set-secrets "OPENAI_API_KEY=openai-key:latest,GOOGLE_MAPS_API_KEY=google-maps-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest"

# 獲取後端網址
gcloud run services describe cola-backend --region asia-east1 --format 'value(status.url)'
```

### Step 4: 部署前端

```bash
cd ../frontend

# 建置（記得替換後端網址）
gcloud builds submit --tag gcr.io/你的專案ID/cola-frontend \
    --build-arg REACT_APP_API_URL=https://你的後端網址

# 部署
gcloud run deploy cola-frontend \
    --image gcr.io/你的專案ID/cola-frontend \
    --platform managed \
    --region asia-east1 \
    --allow-unauthenticated \
    --port 8080

# 獲取前端網址
gcloud run services describe cola-frontend --region asia-east1 --format 'value(status.url)'
```

---

## ✅ 驗證部署

### 測試後端
```bash
curl https://你的後端網址/api/health
```

預期回應：
```json
{
  "success": true,
  "message": "Product Location Story API is running"
}
```

### 測試前端
訪問：`https://你的前端網址`

---

## 🔄 自動 CI/CD（選用）

使用 Cloud Build 從 GitHub 自動部署：

```bash
# 連接 GitHub repository
gcloud builds triggers create github \
    --repo-name=cola \
    --repo-owner=你的GitHub用戶名 \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml
```

之後每次 push 到 main 分支會自動部署！

---

## 📊 成本估算

Cloud Run 免費額度（每月）：
- ✅ 200 萬次請求
- ✅ 360,000 GB-秒記憶體
- ✅ 180,000 vCPU-秒

**預估成本**（超過免費額度後）：
- 後端：~$5-10/月
- 前端：~$2-5/月
- **總計：~$7-15/月**

💡 **省錢技巧**：設定 `--min-instances=0` 讓無流量時縮減到 0

---

## 🌐 自訂網域（選用）

```bash
# 映射網域到前端
gcloud run domain-mappings create \
    --service cola-frontend \
    --domain www.你的網域.com \
    --region asia-east1
```

然後在你的 DNS 設定 CNAME 記錄指向 Cloud Run 提供的網址。

---

## 🐛 故障排除

### 問題 1: 權限錯誤
```bash
# 檢查目前使用的帳號
gcloud auth list

# 重新登入
gcloud auth login
```

### 問題 2: 建置失敗
```bash
# 查看建置日誌
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

### 問題 3: 服務無法啟動
```bash
# 查看服務日誌
gcloud run services logs read cola-backend --region asia-east1 --limit=50
```

### 問題 4: Secrets 無法讀取
```bash
# 檢查 secrets 是否存在
gcloud secrets list

# 檢查權限
gcloud secrets get-iam-policy openai-key
```

---

## 🎁 優勢對比

| 功能 | Cloud Run | Railway | Vercel |
|------|-----------|---------|--------|
| 自動擴展 | ✅ 0-1000+ | ✅ 有限 | ✅ 前端 only |
| 全球 CDN | ✅ Google CDN | ❌ | ✅ Edge |
| 自訂網域 | ✅ 免費 | ✅ 付費 | ✅ 免費 |
| 免費額度 | 200萬請求/月 | $5/月 | 100GB/月 |
| 後端支援 | ✅ 完整 | ✅ 完整 | ⚠️ 有限 |
| 價格透明 | ✅ 按量付費 | ⚠️ 訂閱制 | ✅ 按量付費 |

---

## 🎯 完成！

現在你的應用已經在 GCP 上運行了！

**後端網址：** `https://cola-backend-xxxxx-de.a.run.app`
**前端網址：** `https://cola-frontend-xxxxx-de.a.run.app` ← 分享給用戶

**下一步**：
- 📊 監控流量：https://console.cloud.google.com/run
- 💰 查看成本：https://console.cloud.google.com/billing
- 🔐 管理 Secrets：https://console.cloud.google.com/security/secret-manager

---

需要更詳細的文檔？查看 `GCP_DEPLOY.md`
