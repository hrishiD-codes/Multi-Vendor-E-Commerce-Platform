FROM nginx:1.25-alpine

# Install gettext for envsubst (used to inject PORT and service URLs at startup)
RUN apk add --no-cache gettext

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our configs — default.conf is treated as a template; envsubst runs at startup
COPY nginx.conf      /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/templates/default.conf.template

# Startup: substitute env vars into nginx template then start nginx
# Only the listed vars are substituted; all other nginx $variables are untouched.
CMD ["sh", "-c", \
    "VARS='$PORT $USER_SERVICE_URL $PRODUCT_SERVICE_URL $CART_SERVICE_URL $ORDER_SERVICE_URL $PAYMENT_SERVICE_URL $NOTIFICATION_SERVICE_URL' \
    && envsubst \"$VARS\" \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf \
    && nginx -g 'daemon off;'"]
