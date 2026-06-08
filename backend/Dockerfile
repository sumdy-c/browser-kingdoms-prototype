FROM node:22.20.0-alpine

WORKDIR /app
ENV CI=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start"]
