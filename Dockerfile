FROM node:14-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
COPY . /usr/src/app/

RUN npm install --only=prod

EXPOSE 6001

CMD ["node", "app.js"]

