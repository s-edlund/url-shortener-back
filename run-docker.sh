#!/usr/bin/env bash

docker run -d --name url-shortener-back -p 3001:3001 --network=myNetwork url-shortener-back

