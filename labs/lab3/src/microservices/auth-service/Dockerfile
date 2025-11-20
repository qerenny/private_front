FROM node:23-alpine
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --force
 

COPY . .

ENV NODE_ENV=development
CMD ["pnpm", "dev"]
