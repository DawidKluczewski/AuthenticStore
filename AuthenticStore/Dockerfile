# Etap 1: Budowanie aplikacji
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etap 2: Serwowanie przez Nginx
FROM nginx:alpine
# Kopiujemy zbudowane pliki z etapu 1
COPY --from=build /app/dist /usr/share/nginx/html
# Kopiujemy nasz config Nginxa
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]