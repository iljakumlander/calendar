# calendar
nodejs, React and Typescript driven and node-json-db and fullcalendar based application that produces data endpoint with integrated client and separate run anywhere client.

## Build Instructions:

0. Clone the repository.
1. Run `npm install`.
2. Check a `.env.client` and `.env.server` files to ensure correct URLs and ports are set.

### Create runnable applications
```sh
npm run build
```
This creates the `watch` directory, that icludes `client` and `server` subfolders.

Client is built as SPA, can run in a static file environment, rendered in HTML/JS/CSS bundle.

Server is a node js application.

### Start server application

```sh
npm run server
```
Runs on port ```3000``` by default. Check ```.env.server``` to change it or modify the allowed hosts to include correct domains and port numbers.

### Start client application
```sh
npm run client
```
Runs on port ```8080``` via http-server. Check ```.env.client``` for correct server hostname.

### Autobuild on save
```sh
npm run watch
```
Track file changes and rebuild `client` and `server` applications.

## Deploy
Given known client end point is placed on www.example.com and server is running on api.example.com, create `.env.client.production` and `env.server.production` with content below:

#### `.env.client.production`
```conf
SERVER=http://api.example.com:5000
```

#### `.env.server.production`
```conf
ALLOWED_HOSTS=http://www.example.com,http://example.com
PORT=5000
```

```sh
npm run deploy
```
Prepares files to be deployed, bundle stripped of .map files, production ready builds for `client` and `server` in `deploy` directory.

Note: `client` files are static and can be served from anywhere.

Note: `server` requires a node js server to run `node index.js` in the its directory.

Warning! Database is created upon installation and stored in `data` directory. Deployable build (and development build as well) does not include `data` folder by default as it keeps the database the same accross builds. However, depending on deploy method (Heroku, docker, etc), data may be overwritten or removed upon deploy. To backup database, copy `data/base.json` and copy it with the next delivery.

### SSL
To enable secure layer private key and the certificate should be obtained from certificate issuer and reachable within `/deploy/server` and its sub directories.

`.env.server.production`
```conf
ALLOWED_HOSTS=https://www.example.com,https://example.com
PORT=5000
SSL_KEY=certs/privkey.pem
SSL_CERT=certs/fullchain.pem
```


#### `.env.client.production`
```conf
SERVER=https://api.example.com:5000
```

#### Obtaining private key and certificate from `letsencrypt` using `certbot` via home `brew`
```sh
brew install certbot
```

```sh
sudo certbot certonly --standalone
```

```sh
# Create a directory for the certs that your server will use. This directory can be anywhere in your system.
mkdir ./deploy/server/certs

# Copy the cert files from /etc/letsencrypt/live/yourdomain/ to your new directory.
sudo cp /etc/letsencrypt/live/example.com/privkey.pem ./deploy/server/certs
sudo cp /etc/letsencrypt/live/example.com/fullchain.pem ./deploy/server/certs

# Change the owner and group of the cert files to your node user and group.
sudo chown node_user:node_group ./deploy/server/certs/privkey.pem
sudo chown node_user:node_group ./deploy/server/certs/fullchain.pem

# Set appropriate permissions to protect them from other users.
sudo chmod 640 ./deploy/server/certs/*.pem
```
