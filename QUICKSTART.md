# 快速開始指南

## 🚀 5 分鐘啟動

### 1. 安裝依賴（只需執行一次）

```bash
./install.sh
```

或手動安裝：

```bash
# 安裝後端
cd backend
npm install

# 安裝前端
cd ../frontend
npm install
```

### 2. 設定 API Keys

編輯 `backend/.env`：

```env
PORT=4001
OPENAI_API_KEY=sk-proj-你的OpenAI金鑰
GOOGLE_MAPS_API_KEY=AIzaSy你的Google金鑰
SUPABASE_URL=https://你的專案.supabase.co
SUPABASE_KEY=eyJhbG你的Supabase金鑰
```

**如何取得 API Keys？**

#### OpenAI API Key
1. 訪問 https://platform.openai.com/api-keys
2. 登入後點擊「Create new secret key」
3. 複製金鑰（格式：sk-proj-...）

#### Google Maps API Key
1. 訪問 https://console.cloud.google.com/
2. 創建新專案或選擇現有專案
3. 啟用「Street View Static API」
4. 前往「憑證」→「建立憑證」→「API 金鑰」

#### Supabase
1. 訪問 https://supabase.com/
2. 創建新專案
3. 前往 Settings → API
4. 複製「Project URL」和「anon public」金鑰

### 3. 創建 Supabase Storage Bucket

⚠️ **必須執行此步驟，否則無法上傳圖片！**

1. 登入 Supabase Dashboard
2. 左側選單 → **Storage**
3. 點擊「New bucket」
4. Bucket 名稱：`product-location-images`
5. **✅ 勾選「Public bucket」**
6. 點擊「Create bucket」

### 4. 啟動服務

```bash
./start.sh
```

或手動啟動：

```bash
# 終端 1 - 啟動後端
cd backend
npm start

# 終端 2 - 啟動前端
cd frontend
npm start
```

### 5. 訪問應用

瀏覽器自動打開或手動訪問：
```
http://localhost:4000
```

## 📝 測試範例

使用以下範例快速測試：

**商品名稱：**
```
瑞士經典巧克力禮盒
```

**商品資訊：**
```
來自瑞士阿爾卑斯山脈的手工巧克力，使用 100% 有機可可豆製作，每一塊都是瑞士工匠的心血結晶
```

**商品特色：**
```
口感絲滑、純天然成分、精美包裝、適合送禮、限量生產
```

**人物設定：**
```
一位熱愛旅行的美食部落客，走訪世界各地尋找最道地的美食和最動人的故事
```

## ❓ 常見問題

### 問題 1: 安裝依賴時出錯

**解決方法：**
```bash
# 清除快取並重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 問題 2: 前端無法連接後端

**檢查清單：**
- [ ] 後端服務是否啟動？（應該在 Port 4001）
- [ ] 前端 `.env` 中的 `REACT_APP_API_URL` 是否正確？
- [ ] 瀏覽器 Console 是否有 CORS 錯誤？

### 問題 3: Supabase 上傳失敗

**檢查清單：**
- [ ] Bucket `product-location-images` 是否已創建？
- [ ] Bucket 是否設定為 **Public**？
- [ ] `SUPABASE_URL` 和 `SUPABASE_KEY` 是否正確？

### 問題 4: AI 生成失敗

**檢查清單：**
- [ ] `OPENAI_API_KEY` 是否正確？
- [ ] OpenAI 帳戶是否有足夠額度？
- [ ] 網路連線是否正常？

## 🎯 下一步

成功運行後，可以：

1. **自訂設計**：修改 `frontend/src/index.css` 調整顏色
2. **調整 Prompt**：編輯 `backend/services/ProductLocationStoryService.js`
3. **新增功能**：參考 `README.md` 了解 API 使用方式

## 📚 更多資源

- 完整文檔：[README.md](./README.md)
- API 文檔：查看 `README.md` 的「API 端點」章節
- 技術支援：請參考專案 Issues

---

**祝使用愉快！🎉**
