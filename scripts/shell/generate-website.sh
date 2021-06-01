#!/bin/sh

npm run generate
cd ./../
# aws s3 cp ./dist/ s3://si-demos/roneel-temp --acl public-read --cache-control private --profile sportz --recursive --exclude "_nuxt/*"