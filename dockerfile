# base stage
FROM node:16.17-alpine AS base
WORKDIR /app
COPY package*.json /
EXPOSE 5000

# rely on host node_modules
FROM base AS dev-bind
ENV NODE_ENV=development

# create development container
FROM base AS dev
ENV NODE_ENV=development
RUN yarn global add nodemon && yarn install
COPY . / 
CMD ["yarn", "start:dev"]

#create production container
FROM base AS production
ENV NODE_ENV=production
RUN npm ci
COPY . /
CMD ["node" , "build/server.js"]