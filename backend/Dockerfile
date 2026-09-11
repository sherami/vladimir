FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run typecheck
EXPOSE 3000
CMD ["npm","run","dev"]
