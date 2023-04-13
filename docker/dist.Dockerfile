FROM --platform=amd64 nginx:1.23-alpine@sha256:6318314189b40e73145a48060bff4783a116c34cc7241532d0d94198fb2c9629
ARG DIST_LOCATION
# configuration of system
EXPOSE 80
# Copy dist
WORKDIR /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY ${DIST_LOCATION}/ /usr/share/nginx/html
