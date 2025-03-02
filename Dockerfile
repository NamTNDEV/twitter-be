FROM node:20-alpine

WORKDIR /app

COPY . .

RUN apk update && apk add bash
RUN apk add --no-cache ffmpeg
RUN apk add python3
RUN npm install --force
RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "start" ]