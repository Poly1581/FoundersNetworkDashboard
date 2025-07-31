# check=error=true

FROM node:24-bookworm-slim AS base
WORKDIR /dashboard-frontend
COPY package*.json .
RUN npm install
COPY . .

FROM base AS test
ENV WATCHPACK_POLLING=true
ENV WDS_SOCKET_HOST=localhost
ENV WDS_SOCKET_PORT=3000
WORKDIR /dashboard-frontend
EXPOSE 3000
RUN ["npm", "test"]

FROM test AS final
CMD ["npm", "start"]
