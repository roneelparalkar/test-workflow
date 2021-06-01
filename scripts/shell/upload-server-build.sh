#!/bin/sh

tar -czvf ./final-build.tar.gz ./final-build
aws s3 cp ./final-build.tar.gz s3://si-demos/roneel-temp/ --cache-control private --profile sportz
rm -rf ./final-build