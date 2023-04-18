# be-react-chat-app

This is a simple express js project for chatting.

Technologies using: Exress.js, MongoDB, mongoose, express-session, passport, Socket.io

Authentication: express-session with mongo-connect + passport local strategy

Starting project: 

Make sure that you have an .env file in the root of the project, there are variables you need to set that start working with this repo:
STAGE="development" or "production" - that will automaticly set the correct cookies and cors settings 
for both prod and develop environments
MONGO_DB="your mongodb connection",

LOCAL_FE="your local url"

only if you want to build your BE for hosted FE! Dont forget to set STAGE=production in this case
PROD_FE="your production url"

For starting project locally: 
npm i 
npm run start:dev