# --- Builder ---
# --- Builder ---
FROM node:22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

# Kopiera env först (om den finns)
COPY .env.production .env.production

# Kopiera resten av projektet
COPY . .

RUN npm run build

# --- Runner ---
FROM node:22 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Kopiera endast det som behövs för runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

EXPOSE 3000
CMD ["npm", "start"]
