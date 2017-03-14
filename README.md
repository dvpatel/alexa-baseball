# alexa-baseball
-------------------
Baseball home runs data and samples for Alexa

System Requirements:
-------------------
*  NodeJS +6x
*  Java +6.X (for DynamoDB local)
*  AWS DynamoDB (remote or local)
*  Modules in data/scripts/package.json

Quick Run-time
-------------------
Code Access:  
*  git clone https://github.com/dvpatel/alexa-baseball.git

Install modules:  
*  cd db/scripts
*  npm install
	
Run Samples:  
*  Launch DynamoDB local.  
Instructions:  http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html


Create DynamoDB Tables.
*  node PlayersCreateTable.js
*  node BattingCreateTable.js
This script will create players and batting tables in DynamoDB. 

Import players and batting data.  The data repository is from baseball data bank maintained by Sean Lahaman.
*  node PLayersLoadData.js
*  node BattingLoadData.js

Samples.
Get top home runs hitters for a given time range:
*  node HomerunKing.js 1989 1999



Get all players with greater than "n" home runs in a given year:  
*  node HomerunsSearch.js 2001 50



Search players by last name:
*  node PlayersSearch.js Bonds
