#!/bin/sh

npm install

aws dynamodb delete-table --table-name Teams --endpoint-url http://localhost:8000
aws dynamodb delete-table --table-name Players --endpoint-url http://localhost:8000
aws dynamodb delete-table --table-name Batting --endpoint-url http://localhost:8000

node TeamsCreateTable.js
node PlayersCreateTable.js
node BattingCreateTable.js

node PLayersLoadData.js
node BattingLoadData.js
node TeamsLoadData.js
