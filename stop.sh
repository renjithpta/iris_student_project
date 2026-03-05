#!/bin/bash
set -e

sudo chmod -R +rwx .
if type node > /dev/null 2>&1 && which node > /dev/null 2>&1 ;then
    node -v
    echo "node is installed, skipping..."
else
    echo "install node"
fi
# npm install pm2 -g
current_dir=$(pwd)/hlf-network
explorer_dir=$(pwd)/hlf-explorer
rest_dir=$(pwd)/rest-api

echo "The script is running in: $current_dir"
cd ${current_dir}

./network.sh down
sleep 1
./network.sh down



cd ../..

cd ${explorer_dir}
docker-compose down -v
docker-compose down -v
sudo rm -rf organizations
sleep  1
cd ..
echo "API ...."
cd ${rest_dir}
docker-compose down -v
docker-compose down -v
set -e
pm2 stop rest-client-node
ls -al
cd ..
cd ${current_dir}
./network.sh down
./network.sh down
docker system prune -af --volumes
y | docker image prune -af
y | docker volume prune
y | docker system  prune

echo "done"
echo "------------------ Docker Containers---------------"
docker ps

