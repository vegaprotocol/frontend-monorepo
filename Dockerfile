FROM node:16.14.0-alpine as build
WORKDIR /app
ARG APP
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . ./
RUN yarn nx build ${APP}

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/dist/apps/${APP} /usr/share/nginx/html
# new
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
