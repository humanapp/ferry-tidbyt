ARG TARGETPLATFORM=linux/amd64

# Stage 1: Install Pixlet and prepare environment
FROM --platform=${TARGETPLATFORM} debian:bullseye AS pixlet

RUN apt-get update && apt-get install -y \
    libc6 libc6-i386 libc6-x32 curl tar bash

WORKDIR /usr/local/bin

RUN curl -LO https://github.com/tidbyt/pixlet/releases/download/v0.22.4/pixlet_0.22.4_linux_amd64.tar.gz \
    && tar -xvf pixlet_0.22.4_linux_amd64.tar.gz \
    && rm pixlet_0.22.4_linux_amd64.tar.gz

# Stage 2: Build and run the backend
FROM --platform=${TARGETPLATFORM} node:20-bullseye

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only package files first (to use Docker's build cache)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to /app
COPY . .

# Build the application
RUN npm run build

# Copy Pixlet from the previous stage
COPY --from=pixlet /usr/local/bin/pixlet /usr/local/bin/pixlet

# Define environment variables
ENV PORT=80

# Expose the port your server listens on
EXPOSE 80

# Start the backend server
CMD ["npm", "start"]
