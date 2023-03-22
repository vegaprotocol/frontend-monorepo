# Build container
ARG NODE_VERSION
FROM node:${NODE_VERSION}-alpine as build
WORKDIR /app
# Argument to allow building of different apps
ARG APP
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
COPY . ./
RUN apk add python3 make gcc g++
RUN yarn --network-timeout 100000 --pure-lockfile
RUN yarn nx build ${APP} --network-timeout 100000 --pure-lockfile

# Server environment
FROM nginx:1.23-alpine
ARG APP
# configuration of system
RUN apk add --no-cache bash go-ipfs
EXPOSE 80
COPY entrypoint.sh /entrypoint.sh
CMD ["/entrypoint.sh"]

# Copy dist
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/apps/${APP} /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./apps/${APP}/.env .env
RUN ipfs init && echo "$(ipfs add -rQ.)" > ipfs-hash
