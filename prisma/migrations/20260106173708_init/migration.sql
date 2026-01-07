-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "description" TEXT,
    "place" TEXT,
    "minParticipants" INTEGER,
    "maxParticipants" INTEGER,
    "price" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaData" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "signupStarts" TIMESTAMP(3),
    "signupEnds" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."forms" (
    "id" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "formId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- AddForeignKey
ALTER TABLE "public"."forms" ADD CONSTRAINT "forms_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participants" ADD CONSTRAINT "participants_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
