# some tutorial: https://dev.to/ajipandean/deploy-nestjs-api-to-cloud-run-using-cloud-build-66a

# see https://hub.docker.com/layers/node/library/node/erbium-alpine3.14/images/sha256-e2fbd22d90aaccfc5419348d091f8ed984453eae942749396470c2b2b5eaf4a1?context=explore
#FROM node:erbium-alpine3.15
FROM node:alpine3.16

# all the further commands will execute in this folder
WORKDIR /app

# order of 3 following statements is very important here:
COPY package*.json .

# see https://stackoverflow.com/questions/49530678/why-will-yarn-install-dev-dependencies-when-i-just-need-the-builds
RUN yarn install --ignore-engines

COPY . .

RUN yarn build

EXPOSE 3001

CMD [ "yarn", "start:prod" ] 