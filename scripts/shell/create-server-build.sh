TIMESTAMP=$(date +%s)

cd ./../../
tar -czvf ./releases/$TIMESTAMP.tar.gz ./nuxt-build ./server-middleware ./sdk ./package.json ./config.js