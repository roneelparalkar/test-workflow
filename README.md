# WAF 2.5

## Build Setup

```bash
# install dependencies
$ npm install

# Start SSG
$ cd SSG && node server.js

#Copy client data
$ NODE_ENV=development npx gulp --client=sportsadda (NODE_ENV can be development,production,beta.Client name should match with one of the folder names in clients folder)

#Ingest Redis with required client assets for a specific enviroment (js/css)
npm run ingest-redis

# serve with hot reload at localhost:3000
$ npm run express

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate

#PM2 commands
pm2 start ecosystem.config.js
sudo pm2 start ecosystem.config.js --env beta
sudo pm2 start ecosystem.config.js --env production
```
