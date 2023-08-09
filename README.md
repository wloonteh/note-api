# note-api
Note Taking App API

Uses docker-compose to launch mysql, db and api backend.

## How to Run
1) Open terminal, run docker-compose up --build or docker-compose up -d to build in daemon mode 
2) Wait for redis, mysql and note-api containers to build. End result should be 2 Volumes and 3 containers
3) Check mysql db that initialization script in db/init has run properly and created "users" and "notes" table

## How to Test

### Manual Test
1) Download Postman
2) Import the Notes APP API.Postman Collection.
3) Test using the requests given.
4) Notes Endpoint requires Authorization token, which pulls from Collection Variable token
5) After creating a user and logging in, paste the token into the variable and it should populate the api

### Integration Test
1) Run docker-compose up -d 
2) npm install
2) run npm run test