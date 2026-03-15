FROM node:24
WORKDIR /app
COPY . .
CMD ["node", "bot.js"]