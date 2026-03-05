sleep 4

RESULT=$(curl --location 'localhost:4000/auth/register' --header 'Content-Type: application/json' --data-raw '{  "name": "org1", "username": "eciadmin", "password": "eciadmin123","userType": "org1" }')

echo "---Eci User ...$RESULT"

sleep 2

RESULT=$(curl --location 'localhost:4000/auth/register' --header 'Content-Type: application/json' --data-raw '{  "name": "org2", "username": "public", "password": "public123","userType": "org2" }')

echo "---Org5 User ---> $RESULT"
