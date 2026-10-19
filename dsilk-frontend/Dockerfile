# Estágio Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Estágio de Desenvolvimento (Live Reload / HMR)
FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Estágio de Build (Compilação para Produção)
FROM base AS builder
# O Vite embute VITE_API_URL no build. Em produção a API é acessada pelo proxy
# do nginx em /api (ver nginx.conf), então o mesmo build funciona em localhost
# e em qualquer endereço da rede (ex.: http://192.168.0.2:8080).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm install
COPY . .
RUN npm run build

# Estágio de Produção (Servido com Nginx)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
