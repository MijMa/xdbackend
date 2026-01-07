# psql -U postgres -c "CREATE DATABASE supertokens;"
RUN npx prisma migrate dev --name init
RUN npx prisma generate
