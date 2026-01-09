FROM node:20-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝依賴（只安裝 production dependencies）
RUN npm ci --only=production

# 複製所有檔案
COPY . .

# 暴露 port
EXPOSE 4001

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=4001

# 啟動應用
CMD ["node", "server.js"]
