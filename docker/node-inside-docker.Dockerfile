# Build container
ARG NODE_VERSION
FROM --platform=amd64 node:${NODE_VERSION}-alpine3.16 as build
WORKDIR /app
# Argument to allow building of different apps
ARG APP
ARG ENV_NAME=""
RUN apk add --update --no-cache \
  make==4.3-r0 \
  gcc==11.2.1_git20220219-r2 \
  g++==11.2.1_git20220219-r2
COPY . ./
RUN yarn --pure-lockfile
# work around for different build process in trading
RUN sh docker/docker-build.sh

# Server environment
# if this fails you need to docker pull nginx:1.23-alpine and pin new SHA
# this is to ensure that we run always same version of alpine to make sure ipfs is indempotent
FROM --platform=amd64 nginx:1.23-alpine@sha256:6318314189b40e73145a48060bff4783a116c34cc7241532d0d94198fb2c9629
# configuration of system
EXPOSE 80
# Copy dist
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/apps/${APP}/* /usr/share/nginx/html
RUN apk add --no-cache go-ipfs==0.16.0-r6 \
      && ipfs init \
      && echo "$(ipfs add -rQ /usr/share/nginx/html)" > /ipfs-hash \
      && echo "ipfs hash of this build: $(cat /ipfs-hash)"
