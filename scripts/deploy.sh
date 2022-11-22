#!/bin/bash

exitOnError() {
  if [ ! $? -eq 0 ]; then
    echo $1
    exit 1
  fi
}

WORKING_PATH=$HOME/code/humanapp/ferry-tidbyt
PWD=$(pwd)
SERVICE='kingston'

echo "Deploying"

cd "$WORKING_PATH"
exitOnError "command failed: cd"

npm install --only=prod
exitOnError "command failed: npm install"

echo " #### Restarting service"
pm2 restart $SERVICE
