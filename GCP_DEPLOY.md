# 🌐 GCP Cloud Run 部署指南

## 📋 前置準備

1. **建立 GCP 專案**
   - 訪問：https://console.cloud.google.com/
   - 建立新專案或選擇現有專案
   - 啟用計費（需要信用卡，但有 $300 免費額度）

2. **啟用必要的 API**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **安裝 Google Cloud SDK**
   ```bash
   # macOS
   brew install google-cloud-sdk

   # 登入
   gcloud auth login
   gcloud config set project 你的專案ID
   ```

---

## 🚀 部署步驟

### Step 1: 建立 Dockerfile（後端）

後端已有 `backend/Dockerfile`，內容：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4001
CMD ["node", "server.js"]
```

### Step 2: 部署後端到 Cloud Run

```bash
cd backend

# 建立並推送容器映像
gcloud builds submit --tag gcr.io/你的專案ID/cola-backend

# 部署到 Cloud Run
gcloud run deploy cola-backend \
  --image gcr.io/你的專案ID/cola-backend \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,PORT=4001" \
  --set-secrets "OPENAI_API_KEY=openai-key:latest,GOOGLE_MAPS_API_KEY=google-maps-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_KEY=supabase-key:latest"

# 獲取後端網址
gcloud run services describe cola-backend --region asia-east1 --format 'value(status.url)'
```

### Step 3: 建立 Dockerfile（前端）

前端已有 `frontend/Dockerfile`：
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### Step 4: 建立 nginx.conf（前端）

`frontend/nginx.conf`：
```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass $BACKEND_URL;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 5: 部署前端到 Cloud Run

```bash
cd ../frontend

# 建立並推送容器映像（記得替換後端網址）
gcloud builds submit --tag gcr.io/你的專案ID/cola-frontend \
  --build-arg REACT_APP_API_URL=https://你的後端網址.run.app

# 部署到 Cloud Run
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

## 🔐 設定 Secret Manager（推薦）

不要在 Cloud Run 直接設定 API keys，使用 Secret Manager：

```bash
# 啟用 Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 建立 secrets
echo -n "你的OpenAI金鑰" | gcloud secrets create openai-key --data-file=-
echo -n "你的GoogleMaps金鑰" | gcloud secrets create google-maps-key --data-file=-
echo -n "你的Supabase網址" | gcloud secrets create supabase-url --data-file=-
echo -n "你的Supabase金鑰" | gcloud secrets create supabase-key --data-file=-

# 授權 Cloud Run 讀取 secrets
gcloud secrets add-iam-policy-binding openai-key \
  --member="serviceAccount:你的專案編號-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 對其他 secrets 重複上面的命令
```

---

## 📊 成本估算

Cloud Run 計費方式：
- ✅ 每月 200 萬次請求免費
- ✅ 免費額度包含 360,000 GB-秒記憶體
- ✅ 180,000 vCPU-秒

預估成本（超過免費額度後）：
- 後端：~$5-10/月（中等流量）
- 前端：~$2-5/月
- **總計：~$7-15/月**

---

## 🔄 自動部署（CI/CD）

使用 Cloud Build 自動部署：

建立 `cloudbuild.yaml`：
```yaml
steps:
  # 後端
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/cola-backend', './backend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/cola-backend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'cola-backend'
      - '--image=gcr.io/$PROJECT_ID/cola-backend'
      - '--region=asia-east1'
      - '--platform=managed'

  # 前端
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/cola-frontend',
           '--build-arg', 'REACT_APP_API_URL=${_BACKEND_URL}',
           './frontend']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/cola-frontend']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'cola-frontend'
      - '--image=gcr.io/$PROJECT_ID/cola-frontend'
      - '--region=asia-east1'
      - '--platform=managed'

images:
  - 'gcr.io/$PROJECT_ID/cola-backend'
  - 'gcr.io/$PROJECT_ID/cola-frontend'
```

設定 GitHub 觸發器：
```bash
gcloud builds triggers create github \
  --repo-name=cola \
  --repo-owner=你的GitHub用戶名 \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

---

## ✅ 部署檢查清單

- [ ] GCP 專案已建立
- [ ] 計費已啟用
- [ ] Cloud Run API 已啟用
- [ ] gcloud CLI 已安裝並登入
- [ ] Secret Manager 已設定
- [ ] 後端容器已建立
- [ ] 後端服務已部署
- [ ] 前端容器已建立（使用正確的後端網址）
- [ ] 前端服務已部署
- [ ] 健康檢查通過

---

## 🧪 測試部署

### 測試後端
```bash
curl https://cola-backend-xxxxxxxxxx-de.a.run.app/api/health
```

### 測試前端
訪問：`https://cola-frontend-xxxxxxxxxx-de.a.run.app`

---

## 🌐 自訂網域（選用）

```bash
# 映射自訂網域到前端
gcloud run services add-iam-policy-binding cola-frontend \
  --region=asia-east1 \
  --member="allUsers" \
  --role="roles/run.invoker"

gcloud run domain-mappings create \
  --service cola-frontend \
  --domain www.你的網域.com \
  --region asia-east1
```

---

## 🐛 故障排除

### 問題 1: 建置失敗
```bash
# 查看建置日誌
gcloud builds list --limit=5
gcloud builds log 建置ID
```

### 問題 2: 服務無法啟動
```bash
# 查看服務日誌
gcloud run services logs read cola-backend --region asia-east1 --limit=50
```

### 問題 3: 環境變數未設定
```bash
# 檢查環境變數
gcloud run services describe cola-backend --region asia-east1
```

---

## 📞 優勢

✅ **自動擴展**：流量增加時自動擴展，無流量時縮減到 0
✅ **全球 CDN**：自動使用 Google 全球網路
✅ **HTTPS 自動**：自動提供 SSL 憑證
✅ **按使用付費**：只在有請求時付費
✅ **簡單部署**：單一指令即可部署

---

**準備好部署了嗎？** 🚀
