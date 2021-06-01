#!/bin/sh

cd /home/ubuntu/
aws s3 cp s3://si-waf-codedeploy/sportsaddda-cd/web/builds/final-build.tar.gz ./
rm -rf final-build sportsadda-nuxt
mkdir sportsadda-nuxt
tar -zxvf final-build.tar.gz
rsync -r ./final-build/ ./sportsadda-nuxt/
sudo chmod -R 777 sportsadda-nuxt/
cd sportsadda-nuxt/
rm ecosystem.config.js
aws s3 cp s3://si-waf-codedeploy/sportsaddda-cd/web/ecosystem.config.js ./
npm install --only=prod
sudo apt-get install authbind
sudo touch /etc/authbind/byport/80
sudo chown ubuntu /etc/authbind/byport/80
sudo chmod 755 /etc/authbind/byport/80
authbind --deep pm2 update
sudo pm2 start ecosystem.config.js
sudo chown ubuntu:ubuntu /home/ubuntu/.pm2/rpc.sock /home/ubuntu/.pm2/pub.sock