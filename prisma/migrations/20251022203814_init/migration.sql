-- CreateTable
CREATE TABLE "string_data" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "is_palindrome" BOOLEAN NOT NULL,
    "unique_characters" INTEGER NOT NULL,
    "word_count" INTEGER NOT NULL,
    "sha256_hash" TEXT NOT NULL,
    "character_frequency_map" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "string_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "string_data_value_key" ON "string_data"("value");

-- CreateIndex
CREATE UNIQUE INDEX "string_data_sha256_hash_key" ON "string_data"("sha256_hash");
