#!/usr/bin/env bash

docker run -d --name url-shortener-back-db -p 5432:5432 --network=myNetwork url-shortener-back-db

