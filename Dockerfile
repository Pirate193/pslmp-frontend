FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Build the Next.js production app
RUN bun run build

EXPOSE 3000

# Start the optimized Next.js server
CMD ["bun", "run", "start"]