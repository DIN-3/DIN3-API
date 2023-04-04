# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /POLARAPI
WORKDIR /POLARAPI

# Copy the current directory contents into the container at /POLARAPI
COPY . /POLARAPI

# Install any needed packages specified in package.json
RUN npm install

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Run API.js when the container launches
CMD ["node", "API.js"]