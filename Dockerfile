# Build container
FROM node:16.14.0-alpine as build
WORKDIR /app
# Argument to allow building of different apps
ARG APP
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . ./
RUN yarn nx build $APP

# Production environment
FROM nginx:stable-alpine
ARG APP
COPY --from=build /app/dist/apps/$APP /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY ./apps/$APP/.env .env

# Add bash
RUN apk add --no-cache bash

RUN chmod +x ./env.sh
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
