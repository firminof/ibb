# Etapa de build da aplicação Node.js
FROM node:18-alpine as build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

# Definir o ambiente como produção
ENV NODE_ENV=production

# Executa o build da aplicação Node.js
RUN npm run build

# Etapa final onde apenas o build da aplicação é utilizado
FROM node:18-alpine as final
WORKDIR /app

# Copia os arquivos da build da etapa anterior para a imagem final
COPY --from=build /app ./

# Expõe a porta 3000 para a aplicação Node.js
EXPOSE 3000

# Comando para iniciar a aplicação Node.js
CMD ["npm", "run", "start"]

