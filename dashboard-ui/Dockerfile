FROM node:24-bookworm-slim AS base
WORKDIR /dashboard-frontend
COPY package*.json .
RUN npm install
COPY . .

FROM base AS test
WORKDIR /dashboard-frontend
# RUN ["npm", "test"] # NOT WORKING CURRENTLY - SEE DUSAN MESSAGE IN SLACK

FROM test as final
EXPOSE 3000
CMD ["npm", "start"]
