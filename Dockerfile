FROM node:10

ADD package.json yarn.lock ./

RUN yarn

ADD . .

RUN yarn

CMD ["yarn", "start"]
