FROM node:24-bookworm-slim AS base
WORKDIR /dashboard-frontend
COPY package*.json .
RUN npm install
COPY . .

FROM base AS test
WORKDIR /dashboard-frontend
EXPOSE 3000
RUN ["npm", "test"]

FROM test as final
CMD ["npm", "start"]
