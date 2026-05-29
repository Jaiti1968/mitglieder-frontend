FROM nginx:alpine

ARG NGINX_CONF=nginx-prod.conf

COPY dist /usr/share/nginx/html
COPY docker/${NGINX_CONF} /etc/nginx/conf.d/default.conf

EXPOSE 80