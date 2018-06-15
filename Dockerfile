FROM node:9-alpine

WORKDIR /app

RUN apk add python make g++ --update

ADD package.json ./
RUN npm install

ADD src ./src
ADD bin ./bin
RUN npm link

ENTRYPOINT [ "node", "bin/client.js" ]
