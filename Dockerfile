
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first to leverage Docker caching
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN npx prisma generate

RUN pnpm tsc

EXPOSE 3000

CMD ["pnpm", "start"]

#docker build -t riski-ilmo-backend .
# docker run -d --name riski_ilmo_backend --env-file .env -p 3000:3000 riski-ilmo-backend