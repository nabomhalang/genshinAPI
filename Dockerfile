FROM node:latest

RUN npm install -g nodemon

RUN mkdir /work
WORKDIR /work

COPY package*.json ./

COPY . .

EXPOSE 3000