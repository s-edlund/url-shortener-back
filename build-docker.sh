#!/usr/bin/env bash


if [ "$#" != 1 ]; then
   echo "Pass in database password to build"
   exit -1
else
   echo "Received db  password"
fi

docker build --progress=plain --tag=url-shortener-back --build-arg="DATABASE_PASSWORD=$1" .