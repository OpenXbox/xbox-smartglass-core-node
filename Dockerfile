FROM node:10-alpine

WORKDIR /app

RUN apk add python python-dev libffi-dev openssl-dev make g++ py2-pip gcc --update
RUN pip install cryptography

ADD package.json ./
ADD package-lock.json ./
RUN npm ci

ADD src ./src
ADD bin ./bin
ADD tests ./tests
RUN npm link

ENTRYPOINT [ "node", "bin/client.js" ]
