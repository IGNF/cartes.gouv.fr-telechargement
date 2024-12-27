FROM node:20-alpine AS builder

WORKDIR /app

# installation des dépendances
COPY package.json .
COPY package-lock.json .
RUN npm install

# copie du reste du code
COPY . .

# construction react
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS production

COPY .docker/nginx-default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
WORKDIR /usr/share/nginx/html
# NB : uid=101, gid=101 et port=8080

