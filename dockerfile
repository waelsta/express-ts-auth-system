# base stage
FROM node:16.17-alpine AS base
WORKDIR /app
COPY package*.json /
EXPOSE 5000

# rely on host node_modules
FROM base AS dev-bind
RUN mkdir /home/pictures 
RUN chmod 777 /home/pictures
RUN chown node:node /home/pictures
ENV NODE_ENV=development

# creating a seperate target for testing
FROM base AS dev-bind-test
RUN mkdir /home/pictures 
RUN chmod 777 /home/pictures
RUN chown node:node /home/pictures
ENV NODE_ENV=development

# downloading test picures
RUN mkdir /home/test
RUN wget -O /home/test/picture.jpg https://upload.wikimedia.org/wikipedia/commons/6/6e/Golde33443.jpg
RUN wget -O /home/test/svgPicture.svg https://upload.wikimedia.org/wikipedia/commons/4/4f/SVG_Logo.svg  
RUN wget -O /home/test/large.jpg https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg 
RUN chown -R node:node /home/test
RUN chmod -R 777 /home/test

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