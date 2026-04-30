FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# build Next.js app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]