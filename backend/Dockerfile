FROM node:20-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製所有檔案
COPY . .

# 設定環境變數
ENV NODE_ENV=production

# 啟動應用 (Cloud Run 會自動設置 PORT 環境變數)
CMD ["node", "server.js"]
