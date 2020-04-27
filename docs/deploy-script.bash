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

# deploy app
cd /srv/meteor_build/bundle
MONGO_URL=mongodb://localhost:27017/hikisu_1 ROOT_URL=app.jespervoorendt.nl node main.js
