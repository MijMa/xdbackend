# xdbackend
Backend project for ilmo 1.0

Once the project is setup, running: pnpm build && pnpm dev will be a great shortcut
(Or pnpm build | pnpm dev in windows powershell)

To run install prisma migrations
    npx prisma migrate dev --name init
than run the following for good luck
    npx prisma generate

DB: initial run (Includes supertokens DB)
docker run -d --name postgres --network asteriski-net -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=1234 -p 5432:5432 -v ./scripts/create-supertokens-db.sql:/docker-entrypoint-initdb.d/create-supertokens-db.sql postgres:latest

Supertokens initial run
docker run -d --name supertokens --network asteriski-net -p 3567:3567 --env-file ./.env.supertokens registry.supertokens.io/supertokens/supertokens-postgresql:latest

Creating a user into the supertokens database:
 curl -X POST http://localhost:3000/signup -H "Content-Type: application/json" -d '{"formFields":[{"id":"email","value":"admin"},{"id":"password", "value":"StrongPassword123!"}]}'



Additionally:
npx prisma init to initialize prisma in case its ever needed
Rememba' to also install types:
npm i --save-dev @types/node


Upkeep:
Note that the prisma client must always run prisma generate after the database schema has been changed