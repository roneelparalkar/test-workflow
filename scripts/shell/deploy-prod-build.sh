#!/bin/sh

rm -rf final-build final-build.tar.gz
aws s3 cp s3://si-waf-codedeploy/sportsaddda-cd/web/builds/final-build.tar.gz ./
tar -zxvf final-build.tar.gz
rsync -r ./final-build/ ./sportsadda-nuxt/
cd sportsadda-nuxt/
rm ecosystem.config.js
aws s3 cp s3://si-waf-codedeploy/sportsaddda-cd/web/ecosystem.config.js ./
sudo pm2 reload all