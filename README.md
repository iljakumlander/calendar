# calendar
nodejs, React and Typescript driven and node-json-db and fullcalendar based application that produces data endpoint with integrated client and separate run anywhere client.

### Build Instructions:

0. Clone the repository.
1. Run `npm install`.
2. Check a `.env.client` and `.env.server` files to ensure correct URLs and ports are set.

#### Create runnable applications
```sh
npm run build
```
This creates the `watch` directory, that icludes `client` and `server` subfolders.

Client is built as SPA, can run in a static file environment, rendered in HTML/JS/CSS bundle.

Server is a node js application.

#### Start server application

```sh
npm run server
```
Runs on port ```5000``` by default. Check ```.env.server``` to change it or modify the allowed hosts to include correct domains and port numbers.

#### Start client application
```sh
npm run client
```
Runs on port ```8080``` via http-server. Check ```.env.client``` for correct server hostname.

#### Autobuild on save
```sh
npm run watch
```
Track file changes and rebuild `client` and `server` applications.

#### Deploy
```sh
npm run deploy
```
Prepares files to be deployed, bundle stripped of .map files, production ready builds for `client` and `server` in `deploy` directory.

Note: `client` files are static and can be served from anywhere.

Note: `server` requires a node js server to run `node index.js` in the its directory.

Warning! Database is created upon installation and stored in `data` directory. Deployable build (and development build as well) does not include `data` folder by default as it keeps the database the same accross builds. However, depending on deploy method (Heroku, docker, etc), data may be overwritten or removed upon deploy. To backup database, copy `data/base.json` and copy it with the next delivery.
