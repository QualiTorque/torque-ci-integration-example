#!/bin/bash
TORQUE_EMAIL=<email address>
TORQUE_PASSWORD=<password>
TORQUE_ACCOUNT=<torque account name>

SHORT_TOKEN=$(curl -s -X "POST" "https://qtorque.io/api/accounts/$TORQUE_ACCOUNT/login" -H "accept: text/plain" -H "Content-Type: application/json-patch+json" -d "{\"email\": \"$TORQUE_EMAIL\", \"password\": \"$TORQUE_PASSWORD\"}" | jq -r .access_token)

curl -s -X "POST" "https://qtorque.io/api/token/longtoken" -H "accept: text/plain" -H "Authorization: Bearer $SHORT_TOKEN"-d "" | jq -r .access_token