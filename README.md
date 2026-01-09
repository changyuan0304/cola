# 商品地點故事生成器

AI 智能生成商品故事並自動產生相關地點的 Google Street View 圖片

## 功能特色

✨ **AI 智能文案生成** - 根據商品資訊自動創作包含地點的吸引人故事
📍 **自動地點提取** - 從文案中智能提取 5 個地理位置座標
🖼️ **Street View 圖片** - 自動獲取 Google 街景圖片
✂️ **智能裁切** - 自動去除圖片底部 10% (Google Logo 區域)
☁️ **雲端存儲** - 圖片自動上傳到 Supabase Storage
🎨 **極簡設計** - 黑白灰專業配色，響應式布局

## 技術棧

### 前端
- React 18
- Tailwind CSS
- Lucide React (Icons)
- React Router DOM

### 後端
- Node.js + Express
- OpenAI GPT-4o (文案生成 & 地點提取)
- Google Maps Street View API
- Sharp (圖片處理)
- Supabase Storage

## 快速開始

### 1. 環境要求

- Node.js 18+
- npm 或 pnpm
- OpenAI API Key
- Google Maps API Key
- Supabase 帳號

### 2. 安裝依賴

```bash
# 安裝後端依賴
cd backend
npm install

# 安裝前端依賴
cd ../frontend
npm install
```

### 3. 設定環境變數

#### 後端 (backend/.env)

複製 `.env.example` 並填入實際的 API Keys：

```bash
cd backend
cp .env.example .env
```

編輯 `backend/.env`：

```env
PORT=4001
NODE_ENV=development

# OpenAI API (必填)
OPENAI_API_KEY=sk-proj-...

# Google Maps API (必填)
GOOGLE_MAPS_API_KEY=AIzaSy...

# Supabase (必填)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbG...
```

#### 前端 (frontend/.env)

```bash
cd frontend
cp .env.example .env
```

編輯 `frontend/.env`：

```env
REACT_APP_API_URL=http://localhost:4001
```

### 4. 創建 Supabase Storage Bucket

⚠️ **重要：首次使用前必須執行此步驟**

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 點擊左側選單的 **Storage**
4. 點擊 **Create bucket**
5. 輸入 Bucket 名稱：`product-location-images`
6. ✅ **務必勾選「Public bucket」**
7. 點擊 **Create bucket**

### 5. 啟動服務

#### 啟動後端 (Port 4001)

```bash
cd backend
npm start
# 或使用開發模式（自動重啟）
npm run dev
```

#### 啟動前端 (Port 4000)

開啟新終端視窗：

```bash
cd frontend
npm start
```

### 6. 訪問應用

打開瀏覽器訪問：
```
http://localhost:4000
```

## 使用方式

### Step 1: 輸入商品資訊

填寫以下欄位：

| 欄位 | 說明 | 必填 |
|------|------|------|
| 商品名稱 | 商品的名稱 | ✅ |
| 商品資訊 | 商品的詳細介紹 | ✅ |
| 商品特色 | 商品的特點（選填） | ❌ |
| 人物設定 | 故事角色設定（選填） | ❌ |

**範例輸入：**

```
商品名稱：瑞士經典巧克力禮盒
商品資訊：來自瑞士阿爾卑斯山脈的手工巧克力，使用 100% 有機可可豆製作
商品特色：口感絲滑、純天然成分、精美包裝、適合送禮
人物設定：一位熱愛旅行的美食部落客，走訪世界各地尋找最道地的美食
```

### Step 2: 查看 AI 生成的文案

- AI 會自動生成 200-300 字的商品故事
- 文案會自然融入 3-5 個具體地點
- 可選擇「重新編輯」修改資訊或「生成地點圖片」繼續

### Step 3: 查看生成的地點圖片

系統會自動：
1. 從文案提取 5 個地點座標
2. 獲取 Google Street View 圖片（600x300）
3. 裁切底部 10%（去除 Google Logo）
4. 上傳到 Supabase Storage
5. 顯示最終尺寸 600x270 的圖片

## API 端點

### 1. 生成文案

```http
POST /api/product-location-story/generate-content
Content-Type: application/json

{
  "productName": "商品名稱",
  "productInfo": "商品資訊",
  "productFeatures": "商品特色（選填）",
  "characterSetting": "人物設定（選填）"
}
```

**回應：**
```json
{
  "success": true,
  "content": "生成的商品故事文案..."
}
```

### 2. 生成圖片

```http
POST /api/product-location-story/generate-images
Content-Type: application/json

{
  "content": "商品故事文案"
}
```

**回應：**
```json
{
  "success": true,
  "locations": [
    "46.414382,10.013988",
    "46.415120,10.012450",
    ...
  ],
  "images": [
    {
      "location": "46.414382,10.013988",
      "url": "https://maps.googleapis.com/...",
      "supabaseUrl": "https://xxxxx.supabase.co/storage/..."
    },
    ...
  ]
}
```

### 3. 健康檢查

```http
GET /api/health
GET /api/product-location-story/health
```

## 專案結構

```
product-location-story/
├── frontend/                 # React 前端
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   └── ProductLocationStory.js  # 主組件
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                  # Express 後端
│   ├── routes/
│   │   └── product-location-story.js  # API 路由
│   ├── services/
│   │   └── ProductLocationStoryService.js  # 核心服務
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 成本估算

每次完整流程（生成文案 + 5 張圖片）約 **$0.02 USD**

| 項目 | 費用 | 說明 |
|------|------|------|
| OpenAI GPT-4o | ~$0.02 | 兩次 API 調用 |
| Google Maps API | $0.00 | 每月有免費額度 |
| Supabase Storage | $0.00 | 1GB 內免費 |

## 常見問題

### 1. Supabase 上傳失敗

**錯誤：** `圖片上傳失敗`

**解決方案：**
- 確認 bucket `product-location-images` 已創建
- ✅ 確認 bucket 設定為 **Public**
- 檢查 `SUPABASE_KEY` 是否正確

### 2. Google Street View 無圖片

**錯誤：** `獲取 Street View 圖片失敗`

**解決方案：**
- 檢查 `GOOGLE_MAPS_API_KEY` 是否有效
- 確認 API 啟用了 **Street View Static API**
- 某些地點可能沒有街景圖片（這是正常的，系統會自動跳過）

### 3. AI 生成失敗

**錯誤：** `AI 文案生成失敗`

**解決方案：**
- 檢查 `OPENAI_API_KEY` 是否有效
- 確認 OpenAI 帳戶有足夠額度
- 檢查網路連線

### 4. CORS 錯誤

如果前端無法連接後端，確認：
- 後端服務已啟動（Port 4001）
- `frontend/.env` 中的 `REACT_APP_API_URL` 正確

## 開發筆記

### 圖片處理流程

1. **獲取原圖**：600x300 (Google Street View)
2. **裁切底部 10%**：使用 Sharp 處理
3. **最終尺寸**：600x270
4. **上傳路徑**：`{userId}/{timestamp}_{index}.jpg`

### 黑白灰配色規範

- **主背景**：`bg-gray-50`
- **卡片背景**：`bg-white`
- **主按鈕**：`bg-gray-900` + `hover:bg-gray-800`
- **次要按鈕**：`border-gray-300` + `hover:border-gray-400`
- **文字**：`text-gray-900` / `text-gray-600`

## 授權

MIT License

## 作者

ViralArc Team

---

**需要幫助？**

- 📧 Email: support@viralarc.com
- 📚 文檔: [完整文檔連結]
- 🐛 問題回報: [GitHub Issues]
