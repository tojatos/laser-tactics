FROM node:16.10.0 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g @angular/cli@~12.2.3
COPY . .

EXPOSE 8080 49153

ENV CHOKIDAR_USEPOLLING=true

ENTRYPOINT ["ng", "serve", "--host", "0.0.0.0", "--port", "8080", "--poll", "2000", "--proxy-config", "./src/proxy.conf.docker.json"]
