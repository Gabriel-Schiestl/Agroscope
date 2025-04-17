FROM node:20 AS build-stage

WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build

FROM node:20-bullseye-slim AS production-stage

WORKDIR /app

COPY --from=build-stage /app/dist /app/dist
COPY --from=build-stage /app/node_modules /app/node_modules

COPY package.json /app/package.json

EXPOSE 3000

CMD ["npm", "run", "start:prod"]