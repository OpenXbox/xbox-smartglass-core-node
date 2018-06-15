FROM node:alpine

WORKDIR /app

ADD package.json ./
RUN npm install

ADD src/* ./src/
ADD bin/* ./bin/
RUN npm link

ENTRYPOINT [ "node", "bin/client.js" ]
