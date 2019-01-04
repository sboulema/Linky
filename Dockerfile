# First Stage
FROM node

COPY . .

RUN npm install
RUN npm run gulp build

# Second Stage
FROM nginx

COPY --from=0 dist /usr/share/nginx/html/

EXPOSE 80