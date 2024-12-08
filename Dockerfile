# Stage 1: Install Pixlet and prepare environment
FROM alpine:latest AS pixlet
WORKDIR /usr/local/bin
RUN apk add --no-cache curl tar bash \
    && curl -LO https://github.com/tidbyt/pixlet/releases/download/v0.22.4/pixlet_0.22.4_linux_amd64.tar.gz \
    && tar -xvf pixlet_0.22.4_linux_amd64.tar.gz \
    && rm pixlet_0.22.4_linux_amd64.tar.gz

# Stage 2: Build and run the backend
FROM node:20-alpine
WORKDIR /

# Copy application code and install dependencies
COPY package*.json ./
RUN npm install
RUN npm run build
COPY . .

# Copy Pixlet from the previous stage
COPY --from=pixlet /usr/local/bin/pixlet /usr/local/bin/pixlet

# Expose the port your server listens on
EXPOSE 8082

# Start the backend server using npm start
CMD ["npm", "start"]
