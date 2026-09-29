# Estágio de build
FROM node:20-alpine as builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências (npm ci é mais rápido e confiável para CI/CD)
RUN npm ci

# Copia o restante do código
COPY . .

# Faz o build de produção (gera a pasta dist)
RUN npm run build

# Estágio de produção (Nginx)
FROM nginx:alpine

# Copia os arquivos gerados no estágio anterior para a pasta padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Cria uma configuração básica para SPAs (Single Page Applications)
# Isso garante que se você der F5 em qualquer rota, o Nginx não retorne 404 e direcione para o index.html
RUN echo $'server {\n\
    listen       80;\n\
    server_name  localhost;\n\
    location / {\n\
        root   /usr/share/nginx/html;\n\
        index  index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    error_page   500 502 503 504  /50x.html;\n\
    location = /50x.html {\n\
        root   /usr/share/nginx/html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
