# Build container
ARG NODE_VERSION
FROM --platform=amd64 node:${NODE_VERSION}-alpine3.16 as build
WORKDIR /app
# Argument to allow building of different apps
ARG APP
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
COPY . ./
RUN apk add python3 make gcc g++
RUN yarn --network-timeout 100000 --pure-lockfile
RUN yarn nx build-production ${APP} --network-timeout 100000 --pure-lockfile; \
  if [ "${APP}" = "trading" ]; then mv /app/dist/apps/trading/exporter/ /app/tmp; rm -rf /app/dist/apps/trading; mv /app/tmp /app/dist/apps/trading; fi
  # work around for different build process in trading

# Server environment
# if this fails you need to docker pull nginx:1.23-alpine and pin new SHA
# this is to ensure that we run always same version of alpine to make sure ipfs is indempotent
FROM --platform=amd64 nginx:1.23-alpine@sha256:6318314189b40e73145a48060bff4783a116c34cc7241532d0d94198fb2c9629
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
RUN ipfs init && echo "$(ipfs add -rQ .)" > ipfs-hash
