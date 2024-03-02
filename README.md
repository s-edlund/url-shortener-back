# url-shortener-back
Backend for URL shorteners

Instructions to build and run

* Make sure you have node/npm installed as well as Docker. The code was built using node v21.1.0 and Docker Desktop for Mac
* `export DB_PASSWORD=<password>`. Set `<password>` to any password you'd like to use for connecting to the postgres DB
* `./create-docker-network.sh`
* `cd database`
* `./build.sh $DB_PASSWORD`
* `./run.sh`. The docker container should come up with no errors, check the logs (`docker logs url-shortener-back-db`)
* `cd ..`
* `npm install`
* `npm run build`
* `./build-docker.sh $DB_PASSWORD`
* `./run-docker`
* Check that the container comes up with no errors (`docker logs url-shortener-back`)
* Check that the server is up (load http://localhost:3001/ in a browser)

You can also run a dev version of the server outside of docker using `npm start`

