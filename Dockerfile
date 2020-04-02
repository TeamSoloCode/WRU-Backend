FROM node

RUN mkdir -p /apps/WRUApp-Backend
WORKDIR /apps/WRUApp-Backend

COPY package.json /app/the-app/package.json
COPY . .

RUN npm install
RUN npm install -g nodemon
RUN npm install ts-node -g
RUN npm install typescript -g


EXPOSE 5000 9229


# CMD [ "npm" , "start:dev" ]

# ENTRYPOINT npm install && npm start