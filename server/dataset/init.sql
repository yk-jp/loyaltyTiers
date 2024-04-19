CREATE TABLE "tiers" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "expense" integer,
  "next_target_expense" integer,
  "name" varchar,
  "downgrade_to" varchar,
  "upgrade_to" varchar
);

CREATE TABLE "customers" (
  "id" INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" varchar,
  "tier_id" integer DEFAULT 1,
  "total_expense_tier" integer DEFAULT 0,
  "created_at" timestamp DEFAULT 'now()'
);

CREATE TABLE "orders" (
  "id" varchar PRIMARY KEY,
  "customer_id" integer,
  "order_total" integer,
  "total_cents" integer,
  "ordered_at" timestamp DEFAULT 'now()'
);

-- one to many
ALTER TABLE "customers" ADD FOREIGN KEY ("tier_id") REFERENCES "tiers" ("id");

-- one to many relationship. Add delete cascade.
ALTER TABLE "orders" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- add 'Bronze', 'Silver', and 'Gold' in tiers table.
COPY tiers(name, expense, next_target_expense,downgrade_to,upgrade_to) FROM '/docker-entrypoint-initdb.d/tier.csv' DELIMITER ',' CSV HEADER;

-- add initial dataset in customers table.
COPY customers(name) FROM '/docker-entrypoint-initdb.d/customer.csv' DELIMITER ',' CSV HEADER;
