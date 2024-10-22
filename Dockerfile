FROM node:18-alpine as base
WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

# Linux + Node + Source + Project dependencies + build assets
FROM base AS build
ENV ENV=production
WORKDIR /build
COPY --from=base /app ./

FROM nginx:1.23-alpine

RUN apk add nodejs-current npm
RUN npm install -g pm2

COPY --from=build /app/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/nginx/default.conf /etc/nginx/conf.d

WORKDIR /app
# Copy from the stage production
COPY --from=build /app ./
RUN npm run build

# Launch app with PM2
#RUN pm2 start npm -- start

EXPOSE 3000
EXPOSE 80

ENTRYPOINT ["sh", "./exec.sh"]