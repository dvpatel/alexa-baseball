aws --debug lambda invoke \
--invocation-type RequestResponse \
--function-name homerunking \
--region us-east-1 \
--log-type Tail \
--payload '{"key1":"bar", "key2":"y", "key3":"down"}' \
outputfile.txt
