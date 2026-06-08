FROM node:22.20.0-alpine

WORKDIR /app
ENV CI=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
