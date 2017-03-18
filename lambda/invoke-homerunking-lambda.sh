aws --debug lambda invoke \
--invocation-type RequestResponse \
--function-name homerunking \
--region us-east-1 \
--log-type Tail \
--payload '{"startYear":"1919", "endYear":"1929"}' \
outputfile.txt
