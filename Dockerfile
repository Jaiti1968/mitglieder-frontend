FROM nginx:alpine

ARG NGINX_CONF=nginx-prod.conf

COPY dist /usr/share/nginx/html
COPY docker/${NGINX_CONF} /etc/nginx/conf.d/default.conf

RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 80