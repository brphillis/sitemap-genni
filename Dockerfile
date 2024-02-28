# base node image
FROM node:18-alpine as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Build the production image with minimal footprint
FROM base

WORKDIR /sitemap-generator

ADD . .

RUN rm -rf /var/cache/apk/*

CMD ["npm", "run", "start"]