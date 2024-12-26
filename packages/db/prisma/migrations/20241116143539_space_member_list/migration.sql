-- CreateTable
CREATE TABLE "_UserSpaces" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserSpaces_AB_unique" ON "_UserSpaces"("A", "B");

-- CreateIndex
CREATE INDEX "_UserSpaces_B_index" ON "_UserSpaces"("B");

-- AddForeignKey
ALTER TABLE "_UserSpaces" ADD CONSTRAINT "_UserSpaces_A_fkey" FOREIGN KEY ("A") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSpaces" ADD CONSTRAINT "_UserSpaces_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
