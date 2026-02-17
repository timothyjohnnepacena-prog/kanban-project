# Step 1: Use a professional Node.js base
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of your code
COPY . .

# Step 5: Build the NestJS project
RUN npm run build

# Step 6: Expose port 8080 (Standard for GCP Cloud Run)
EXPOSE 8080

# Step 7: Start the server in production mode
CMD ["npm", "run", "start:prod"]