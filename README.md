# xdbackend
Backend project for ilmo 1.0

once the project is setup, running: pnpm build && pnpm dev will be a great shortcut

To run install prisma migrations
    npx prisma migrate dev --name init
than run the following for good luck
    npx prisma generate

DB: initial run
docker run -d --name postgres --network asteriski-net -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=1234 -p 5432:5432 postgres:latest


Additionally:
npx prisma init to initialize prisma in case its ever needed
Rememba' to also install types:
npm i --save-dev @types/node


Upkeep:
Note that the prisma client must always run prisma generate after the database schema has been changed