# original distro is stretch
FROM node:11

RUN     mkdir -p app/data app/scripts

RUN apt-get update && \
    apt-get install awscli git zip -y && \
    rm -rf /var/lib/apt/lists/*

COPY node_modules app/node_modules
COPY build app/build
COPY server app/server
COPY scripts/decrypt.sh app/scripts/

COPY package.json package-lock.json .babelrc CHANGELOG.md commit-id artifact-id production.env.* scripts/startaws.sh app/

WORKDIR /app

CMD ./startaws.sh
