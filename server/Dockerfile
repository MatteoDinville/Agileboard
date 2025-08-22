FROM node:18

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma db push && npm run dev"]
