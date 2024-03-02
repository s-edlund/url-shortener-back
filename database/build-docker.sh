#!/usr/bin/env bash

if [ "$#" != 2 ]; then
   echo "Pass in database user and database password to build"
   exit -1
else
   echo "Received db user and password"
fi

docker build --progress=plain --tag=url-shortener-back-db --build-arg="DATABASE_USER=$1" --build-arg="DATABASE_PASSWORD=$2" .