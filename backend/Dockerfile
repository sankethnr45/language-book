# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of your application's source code
COPY . .

# Your app listens on a port defined by the PORT environment variable.
# We'll expose a default port (e.g., 8000) and map it in AWS.
EXPOSE 8000

# The command to run your app
CMD ["npm", "start"]