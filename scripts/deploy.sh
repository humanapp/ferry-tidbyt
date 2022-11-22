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

echo " #### Building service: "$SERVICE
cd "$WORKING_PATH"
exitOnError "command failed: cd"

npm install
exitOnError "command failed: npm install"

npm run build
exitOnError "command failed: npm run build"

echo " #### Restarting service"
pm2 restart $SERVICE
