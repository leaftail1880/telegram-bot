FROM node:24-slim

WORKDIR /usr/bot

COPY package.json .
COPY yarn.lock .
COPY src src

RUN npm -g install corepack@0.31

RUN corepack enable

RUN yarn install --frozen-lockfile

CMD [ "node", "." ]