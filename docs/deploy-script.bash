cd /srv/meteor_app

# start the package build
npm install --production
meteor build /srv/meteor_build

# go to build directory and unpack
cd /srv/meteor_build
tar -zxvf meteor_app.tar.gz

# remove archive
rm -rf meteor_app.tar.gz

# install npm packages
cd bundle/programs/server && npm install

# deploy app, run as background with nohup. Need better solution. (.service)
cd /srv/meteor_build/bundle
MONGO_URL=mongodb://127.0.0.1:27017/hikisu_1 ROOT_URL=http://127.0.0.1 PORT=3000 nohup node main.js &
