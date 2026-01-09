# 🚂 Railway 部署指南

## 📋 前置準備

1. **註冊 Railway 帳號**
   - 訪問：https://railway.app/
   - 使用 GitHub 登入

2. **安裝 Railway CLI**（選用）
   ```bash
   npm install -g @railway/cli
   railway login
   ```

---

## 🚀 部署步驟

### 方法 1：使用 Railway 網頁介面（推薦）

#### Step 1: 創建專案

1. 登入 Railway Dashboard
2. 點擊 **New Project**
3. 選擇 **Deploy from GitHub repo**
4. 授權並選擇你的 repository

#### Step 2: 創建後端服務

1. 點擊 **+ New Service**
2. 選擇 **GitHub Repo**
3. 設定：
   - **Root Directory**: `backend`
   - **Service Name**: `product-story-backend`

4. 配置環境變數（Settings → Variables）：
   ```
   PORT=4001
   NODE_ENV=production
   OPENAI_API_KEY=你的OpenAI金鑰
   GOOGLE_MAPS_API_KEY=你的GoogleMaps金鑰
   SUPABASE_URL=你的Supabase網址
   SUPABASE_KEY=你的Supabase金鑰
   ```

5. 點擊 **Deploy**

#### Step 3: 創建前端服務

1. 點擊 **+ New Service**
2. 選擇 **GitHub Repo**（同一個 repo）
3. 設定：
   - **Root Directory**: `frontend`
   - **Service Name**: `product-story-frontend`

4. 配置環境變數：
   ```
   REACT_APP_API_URL=https://你的後端網址.railway.app
   ```

5. 點擊 **Deploy**

#### Step 4: 生成公開網址

1. 進入後端服務 → **Settings** → **Networking**
2. 點擊 **Generate Domain**
3. 複製後端網址（例如：`https://product-story-backend-production.up.railway.app`）

4. 進入前端服務 → **Settings** → **Variables**
5. 更新 `REACT_APP_API_URL` 為上面的後端網址

6. 進入前端服務 → **Settings** → **Networking**
7. 點擊 **Generate Domain**
8. 複製前端網址（這就是你的網站網址）

---

### 方法 2：使用 Railway CLI

```bash
# 1. 初始化專案
railway init

# 2. 連結專案
railway link

# 3. 部署後端
cd backend
railway up

# 4. 設定環境變數
railway variables set OPENAI_API_KEY="sk-..."
railway variables set GOOGLE_MAPS_API_KEY="AIza..."
railway variables set SUPABASE_URL="https://..."
railway variables set SUPABASE_KEY="eyJ..."

# 5. 部署前端
cd ../frontend
railway up

# 6. 設定前端環境變數
railway variables set REACT_APP_API_URL="https://你的後端網址.railway.app"
```

---

## 🔧 環境變數清單

### 後端環境變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `PORT` | 後端 Port | `4001` |
| `NODE_ENV` | 環境 | `production` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-proj-...` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API Key | `AIzaSy...` |
| `SUPABASE_URL` | Supabase 專案網址 | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase Service Role Key | `eyJhbG...` |

### 前端環境變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `REACT_APP_API_URL` | 後端 API 網址 | `https://xxx.railway.app` |

---

## ✅ 部署檢查清單

- [ ] 後端服務已啟動
- [ ] 前端服務已啟動
- [ ] 後端健康檢查通過：`GET /api/health`
- [ ] 前端可以訪問後端 API
- [ ] Supabase 連線正常
- [ ] OpenAI API 可以呼叫
- [ ] Google Maps API 可以呼叫

---

## 🧪 測試部署

### 測試後端
```bash
curl https://你的後端網址.railway.app/api/health
```

預期回應：
```json
{
  "success": true,
  "message": "Product Location Story API is running",
  "timestamp": "2026-01-07T..."
}
```

### 測試前端
訪問：`https://你的前端網址.railway.app`

---

## 📊 成本估算

Railway 免費方案：
- ✅ $5 USD 免費額度/月
- ✅ 2 個服務（前端 + 後端）
- ✅ 自動 HTTPS
- ✅ 自動部署

預估成本（超過免費額度後）：
- 後端：~$3-5/月
- 前端：~$2-3/月
- **總計：~$5-8/月**

---

## 🔄 自動部署

Railway 會自動監聽 GitHub repository 的變更：
- 每次 push 到 `main` 分支會自動部署
- 可在 Railway Dashboard 查看部署日誌

---

## 🐛 故障排除

### 問題 1: 後端啟動失敗
**檢查：**
- 環境變數是否正確設定
- `nixpacks.toml` 是否存在
- Dependencies 是否安裝成功

### 問題 2: 前端無法連接後端
**檢查：**
- `REACT_APP_API_URL` 是否正確
- 後端是否有啟用 CORS
- 後端服務是否正常運行

### 問題 3: 圖片處理失敗
**原因：** Sharp 需要編譯
**解決：** Railway 會自動處理（nixpacks 已配置）

---

## 📞 需要幫助？

- Railway 文檔：https://docs.railway.app/
- Railway Discord：https://discord.gg/railway
- 專案 Issues：在你的 GitHub repo 創建 issue

---

**部署完成後，記得將網址分享給用戶！** 🎉
