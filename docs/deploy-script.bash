# Remove the current backup folder if present
cd /srv/meteor_build
rm -rf bundle_old

# kill running process and rename folder while building new version
cd /srv/meteor_build/bundle &&
kill `cat node_PID.txt` &&
rm node_PID.txt &&
cd .. &&
mv bundle bundle_old

# start the package build
cd /srv/meteor_app
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
MONGO_URL=mongodb://127.0.0.1:27017/hikisu_1 ROOT_URL=http://127.0.0.1 PORT=3000 nohup node main.js > nohup_node.log 2>&1 &
#save PID of last process executed ($!) to file
echo $! > node_PID.txt
