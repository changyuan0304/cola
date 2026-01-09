# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製所有檔案
COPY . .

# 設定後端 API 網址（build time argument）
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 建置 React 應用
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# 複製建置好的檔案到 nginx
COPY --from=build /app/build /usr/share/nginx/html

# 複製 nginx 設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 port 8080（Cloud Run 預設）
EXPOSE 8080

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
