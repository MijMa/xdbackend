# xdbackend
Backend project for ilmo 1.0

To run install prisma migrations
npx prisma migrate dev --name init

npx prisma init

DB: initial run
docker run -d --name postgres --network asteriski-net -e POSTGRES_DB=postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=1234 -p 5432:5432 postgres:latest
