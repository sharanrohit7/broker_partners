-- CreateTable
CREATE TABLE "public"."brokers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "auth_method" TEXT NOT NULL,
    "auth_config" JSONB NOT NULL,
    "base_url" TEXT NOT NULL,
    "api_version" TEXT,
    "headers" JSONB NOT NULL,
    "token_types" JSONB NOT NULL,
    "token_refresh_config" JSONB NOT NULL,
    "rate_limit" JSONB,
    "metadata" JSONB,

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_broker_credentials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "broker_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "credentials" JSONB NOT NULL,
    "tokens" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "user_broker_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "broker_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "order_type" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30),
    "trigger_price" DECIMAL(65,30),
    "validity" TEXT,
    "broker_order_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "status_message" TEXT,
    "executed_quantity" INTEGER DEFAULT 0,
    "executed_price" DECIMAL(65,30),
    "executed_at" TIMESTAMP(3),
    "broker_metadata" JSONB,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."request_logs" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "broker_id" TEXT,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "headers" JSONB,
    "payload" JSONB,
    "status_code" INTEGER,
    "response" JSONB,
    "response_time" INTEGER,
    "level" TEXT NOT NULL,
    "message" TEXT,
    "error" JSONB,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brokers_name_key" ON "public"."brokers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_broker_credentials_user_id_broker_id_key" ON "public"."user_broker_credentials"("user_id", "broker_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_request_id_key" ON "public"."orders"("request_id");

-- AddForeignKey
ALTER TABLE "public"."user_broker_credentials" ADD CONSTRAINT "user_broker_credentials_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "public"."brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "public"."brokers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "public"."user_broker_credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_logs" ADD CONSTRAINT "request_logs_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "public"."brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_logs" ADD CONSTRAINT "request_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
