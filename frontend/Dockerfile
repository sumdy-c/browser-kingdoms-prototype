ARG NODE_IMAGE=mirror.gcr.io/library/node:22.20.0-alpine
ARG NPM_REGISTRY=https://registry.npmmirror.com
FROM ${NODE_IMAGE}
ARG NPM_REGISTRY

WORKDIR /app
ENV CI=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false
COPY package*.json ./
RUN NODE_OPTIONS=--tls-max-v1.2 npm ci --no-audit --no-fund \
    --registry=${NPM_REGISTRY} \
    --replace-registry-host=always \
    --maxsockets=1 \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=20000 \
    --fetch-retry-maxtimeout=120000
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
