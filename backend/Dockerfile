FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json tsconfig.build.json ./
RUN npm ci
COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node","dist/server.js"]
