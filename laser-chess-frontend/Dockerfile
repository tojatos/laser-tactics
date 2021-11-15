FROM node:16.10.0 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm install -g @angular/cli
COPY . .

ENTRYPOINT ng serve --host 0.0.0.0 --port 8080 --proxy-config ./src/proxy.conf.docker.json
