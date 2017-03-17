#!/bin/sh

npm install

aws dynamodb delete-table --table-name Teams --endpoint-url http://localhost:8000
node TeamsCreateTable.js
node TeamsLoadData.js

aws dynamodb delete-table --table-name Players --endpoint-url http://localhost:8000
node PlayersCreateTable.js
node PLayersLoadData.js

aws dynamodb delete-table --table-name Batting --endpoint-url http://localhost:8000
node BattingCreateTable.js
node BattingLoadData.js
