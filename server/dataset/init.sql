CREATE TABLE "customers" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" varchar,
  "created_at" timestamp DEFAULT 'now()'
);

CREATE TABLE "orders" (
  "id" varchar PRIMARY KEY,
  "customer_id" integer,
  "total_cents" integer,
  "ordered_at" timestamp
);

ALTER TABLE "orders" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

-- add initial dataset in customers table.
COPY customers(name) FROM '/docker-entrypoint-initdb.d/customer.csv' DELIMITER ',' CSV HEADER;