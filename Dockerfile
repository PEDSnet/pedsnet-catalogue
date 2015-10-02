FROM nginx

WORKDIR /

# Add distribution files to html directory to be served.
ADD ./dist/ /usr/share/nginx/html/

# Add custom nginx config to accomodate SPA
ADD nginx.conf /etc/nginx/
ADD mime.types /etc/nginx/
ADD default /etc/nginx/sites-enabled/default
RUN mkdir -p /usr/share/nginx/logs

# Entrypoint does some file manipulation based on environment
# variables.
ADD entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD ["nginx"]
