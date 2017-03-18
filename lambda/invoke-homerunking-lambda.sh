aws --debug lambda invoke \
--invocation-type RequestResponse \
--function-name HomerunKingLambda \
--region us-east-1 \
--log-type Tail \
--payload '{"startYear":"2000", "endYear":"2001"}' \
outputfile.txt
