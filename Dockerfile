FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install --no-cache

COPY . .

EXPOSE 3000

CMD ["yarn", "run", "start:dev"]