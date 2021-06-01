#!/bin/sh

aws s3 cp s3://si-demos/roneel-temp/final-build.tar.gz ./
rm -rf final-build
tar -zxvf final-build.tar.gz
rsync -r ./final-build/ ./sportsadda-nuxt/
cd sportsadda-nuxt/
npm install --only=prod
pm2 reload Waf-Nuxt