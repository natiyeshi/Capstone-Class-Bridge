-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_id_key" ON "settings"("id");
