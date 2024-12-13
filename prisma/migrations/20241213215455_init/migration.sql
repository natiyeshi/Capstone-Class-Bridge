-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "brand" TEXT
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "phone_number" TEXT,
    "country" TEXT
);

-- CreateTable
CREATE TABLE "CompetitorImportData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER,
    "unit" TEXT,
    "unit_price" REAL,
    "total_price" REAL,
    "order_date" DATETIME,
    "shelf_life" TEXT,
    "mode_of_shipment" TEXT,
    "product_name" TEXT,
    "product_brand" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "company_name" TEXT,
    "productId" TEXT,
    "supplierId" TEXT,
    CONSTRAINT "CompetitorImportData_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CompetitorImportData_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER,
    "unit" TEXT,
    "unit_price" REAL,
    "total_price" REAL,
    "order_date" DATETIME,
    "shelf_life" DATETIME,
    "mode_of_shipment" TEXT,
    "product_name" TEXT,
    "product_brand" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT,
    "supplierId" TEXT,
    CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Inventory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "label" TEXT
);

-- CreateTable
CREATE TABLE "SellsTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER,
    "total_price" REAL,
    "created_at" DATETIME,
    "customerId" TEXT,
    "sellsId" TEXT,
    CONSTRAINT "SellsTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SellsTransaction_sellsId_fkey" FOREIGN KEY ("sellsId") REFERENCES "Sells" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sells" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "IODM" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT,
    CONSTRAINT "IODM_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipment" TEXT,
    "quantity" INTEGER,
    "invoice_amount" REAL,
    "productId" TEXT,
    CONSTRAINT "Pipeline_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_key" ON "Product"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_id_key" ON "Supplier"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorImportData_id_key" ON "CompetitorImportData"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_id_key" ON "Inventory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_id_key" ON "Customer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SellsTransaction_id_key" ON "SellsTransaction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Sells_id_key" ON "Sells"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IODM_id_key" ON "IODM"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_id_key" ON "Pipeline"("id");
