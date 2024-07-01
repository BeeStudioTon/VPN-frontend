FROM node:22-alpine as builder

WORKDIR /app

COPY yarn*.lock ./

RUN yarn

COPY . .

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app .

RUN yarn build

CMD ["yarn", "start"]

EXPOSE 3000