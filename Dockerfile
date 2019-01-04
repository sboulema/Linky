# First Stage
FROM shito/alpine-node-gulp

COPY . /usr/share/nginx/html

RUN echo '{ "allow_root": true }' > /root/.bowerrc

RUN npm install
RUN gulp build

# Second Stage
FROM nginx

COPY --from=0 /usr/share/nginx/html/dist /usr/share/nginx/html/

EXPOSE 80