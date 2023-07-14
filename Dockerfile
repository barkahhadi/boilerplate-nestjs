FROM node:16-alpine

COPY . /www/app
WORKDIR /www/app
RUN npm install
