#!/bin/bash
set -eu -o pipefail
set -x

SERVER="http://localhost:3000"

MANAGER_ADDRESS="10b3a5d8551183a00f429d165d5f480139b93706"
MANAGER_KEY="635202ecb8337035982eb7d21269375f67652e51a9ac7f31e98e0006a1745fed"
MANAGER_CREDS="-d address=${MANAGER_ADDRESS} -d key=${MANAGER_KEY}"

TEST_ADDRESS="2482641cf04753ed4e11778c76acfbc8f3637bfe"
TEST_KEY="f4f73ad7ef17876944bce4812f75f57cf06e21fe081ddd0fb12695e389c09cac"
TEST_CREDS="-d address=${TEST_ADDRESS} -d key=${TEST_KEY}"

MANAGER_NAME="MANAGER"
# $MANAGER_NAME is a name claimed by the manager account
# if this is the first run, and the name is not claimed yet, we do it now
# the loop should run exactly one time in that case

manager_name="$(curl -s $SERVER/getName/${MANAGER_ADDRESS})"
while [ "$manager_name" != "$MANAGER_NAME" ]; do
	#sleep 5 # /getName seems to return old value immediately after /claimName
	curl $MANAGER_CREDS $SERVER/claimName/${MANAGER_NAME}
	manager_name="$(curl -s $SERVER/getName/${MANAGER_ADDRESS})"
done

# from test account, we should be able to claim a random name
# TODO: actually check for Tx status programmatically

test_name=TEST_$RANDOM
curl $TEST_CREDS $SERVER/claimName/${test_name}
curl -s $SERVER/getName/${TEST_ADDRESS} # check!
curl -s $SERVER/getAddr/${test_name} # check!

# from test account, we shouldn't be able to claim to claim $MANAGER_NAME
curl $TEST_CREDS $SERVER/claimName/${MANAGER_NAME}
curl -s $SERVER/getName/${TEST_ADDRESS} # check!
curl -s $SERVER/getAddr/${test_name} # check!
