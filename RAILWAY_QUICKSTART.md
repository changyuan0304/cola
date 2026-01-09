# 🚂 Railway 快速部署（5分鐘）

## 📱 方法 1：網頁介面部署（推薦，最簡單）

### Step 1: 準備 GitHub Repository

```bash
cd /Users/yu-an/Desktop/product-location-story

# 初始化 Git（如果還沒有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Ready for Railway deployment"

# 創建 GitHub repository（可選，建議）
# 訪問 https://github.com/new
# 然後執行：
git remote add origin https://github.com/你的用戶名/product-location-story.git
git branch -M main
git push -u origin main
```

### Step 2: 在 Railway 創建專案

1. **訪問：** https://railway.app/
2. **登入** 使用 GitHub 帳號
3. 點擊 **New Project**
4. 選擇 **Deploy from GitHub repo**
5. 選擇你的 `product-location-story` repository

### Step 3: 配置後端服務

1. Railway 會自動偵測到 monorepo
2. 點擊 **+ New Service** → **GitHub Repo**
3. 設定：
   - **Root Directory**: `backend`
   - **Service Name**: `backend`

4. 進入服務 → **Variables** 標籤
5. 點擊 **+ New Variable**，添加：
   ```
   OPENAI_API_KEY = 你的_OpenAI_金鑰
   GOOGLE_MAPS_API_KEY = 你的_Google_Maps_金鑰
   SUPABASE_URL = 你的_Supabase_網址
   SUPABASE_KEY = 你的_Supabase_金鑰
   PORT = 4001
   NODE_ENV = production
   ```

6. 點擊 **Settings** → **Networking**
7. 點擊 **Generate Domain**
8. 複製後端網址（例如：`https://backend-production-xxxx.up.railway.app`）

### Step 4: 配置前端服務

1. 點擊 **+ New Service** → **GitHub Repo**（同一個 repo）
2. 設定：
   - **Root Directory**: `frontend`
   - **Service Name**: `frontend`

3. 進入服務 → **Variables** 標籤
4. 添加環境變數：
   ```
   REACT_APP_API_URL = https://你剛剛複製的後端網址.up.railway.app
   ```

5. 點擊 **Settings** → **Networking**
6. 點擊 **Generate Domain**
7. 複製前端網址 → **這就是你的網站！** 🎉

---

## 💻 方法 2：CLI 部署（進階）

```bash
# 1. 安裝 Railway CLI
npm install -g @railway/cli

# 2. 登入
railway login

# 3. 初始化專案
railway init

# 4. 部署後端
cd backend
railway up

# 設定環境變數
railway variables set OPENAI_API_KEY="sk-5M9..."
railway variables set GOOGLE_MAPS_API_KEY="AIza..."
railway variables set SUPABASE_URL="https://..."
railway variables set SUPABASE_KEY="eyJh..."
railway variables set PORT="4001"
railway variables set NODE_ENV="production"

# 5. 部署前端
cd ../frontend
railway up

# 設定環境變數（記得替換成你的後端網址）
railway variables set REACT_APP_API_URL="https://backend-production-xxxx.up.railway.app"
```

---

## ✅ 驗證部署

### 測試後端
```bash
curl https://你的後端網址.railway.app/api/health
```

應該看到：
```json
{
  "success": true,
  "message": "Product Location Story API is running"
}
```

### 測試前端
在瀏覽器訪問：`https://你的前端網址.railway.app`

---

## 🎯 完成！

你的應用現在已經在線上運行了！

**後端網址：** `https://backend-production-xxxx.up.railway.app`
**前端網址：** `https://frontend-production-xxxx.up.railway.app` ← 分享這個給用戶

---

## 📊 成本

Railway 免費額度：
- ✅ $5 USD/月
- ✅ 足夠運行這個應用

超過後：
- 後端：~$3-5/月
- 前端：~$2-3/月

---

## 🔄 自動部署

每次你 push 到 GitHub：
```bash
git add .
git commit -m "Update features"
git push
```

Railway 會自動重新部署！ 🚀

---

## ❓ 問題排查

### 後端部署失敗？
1. 檢查 **Variables** 是否都設定了
2. 查看 **Deployments** → 點擊最新部署 → **View Logs**

### 前端無法連接後端？
1. 確認 `REACT_APP_API_URL` 設定正確
2. 確認後端網址結尾**沒有** `/`

### 圖片無法生成？
1. 確認 OpenAI API Key 有額度
2. 確認 Google Maps API 已啟用

---

需要更詳細的說明？查看 `DEPLOY.md`
