# alexa-baseball
Baseball home runs data and samples for Alexa

#System Requirements:
*  NodeJS +6x
*  Java +6.X (for DynamoDB local)
*  AWS DynamoDB (remote or local)
*  Modules in data/scripts/package.json

## Installation & Setup
Code Access:  
*  git clone https://github.com/dvpatel/alexa-baseball.git

Install modules:  
*  cd db/scripts
*  npm install
	
Run Samples:  
*  Launch DynamoDB local.  
Instructions:  http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html

Create DynamoDB Tables.
*  cd db/scripts folder
*  npm install
*  node PlayersCreateTable.js
*  node BattingCreateTable.js
*  node TeamsCreateTable.js

This script will create players and batting tables in DynamoDB. 

Import players and batting data.  The data repository is from baseball data bank maintained by Sean Lahaman.
*  node PLayersLoadData.js
*  node BattingLoadData.js
*  node TeamsLoadData.js

## Code Examples

*  cd samples folder.
*  npm install

To get top home runs hitters for a given time range:
*  node HomerunKing.js 1999 2009

To get all players with greater than "n" home runs in a given year:  
*  node HomerunsSearch.js 2001 45

And to search players by last name:
*  node PlayersSearch.js Bonds