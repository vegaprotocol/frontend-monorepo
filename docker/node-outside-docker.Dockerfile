FROM --platform=amd64 nginx:1.23-alpine@sha256:6318314189b40e73145a48060bff4783a116c34cc7241532d0d94198fb2c9629
EXPOSE 80
COPY docker/entrypoint.sh /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY ./dist-result/ /usr/share/nginx/html/
RUN apk add --no-cache go-ipfs==0.16.0-r6 \
      && ipfs init \
      && echo "$(ipfs add -rQ /usr/share/nginx/html)" > /ipfs-hash \
      && echo "ipfs hash of this build: $(cat /ipfs-hash)"

