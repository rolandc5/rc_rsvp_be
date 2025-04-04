FROM node
RUN mkdir /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 21790
CMD ["npm", "start"]
