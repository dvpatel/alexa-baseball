#!/bin/sh

cp config.json.aws config.json

rm -rf node_modules 

npm install

zip -r ./homerunking.zip config.json HomerunKingLambda.js node_modules/

aws lambda create-function \
--region us-east-1 \
--function-name HomerunKingLambda \
--zip-file fileb:///Users/dipesh/Development/workspace/alexa-sports-nation/lambda/homerunking.zip \
--role arn:aws:iam::723307513402:role/AlexaLambda \
--environment Variables={ALEXA_APP_ID=$1} \
--handler HomerunKingLambda.handler \
--timeout 10 \
--runtime nodejs6.10

cp config.json.local config.json
