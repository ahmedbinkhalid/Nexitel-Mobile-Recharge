CREATE TABLE "activation_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"iccid" text NOT NULL,
	"imei" text,
	"mobile_number" text,
	"sku" text NOT NULL,
	"carrier" text NOT NULL,
	"service_type" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_address" text NOT NULL,
	"customer_address_2" text,
	"city" text,
	"state" text,
	"zip" text,
	"email" text NOT NULL,
	"comments_notes" text,
	"auto_renew" text,
	"date_of_activation" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"activation_fee" numeric(10, 2) DEFAULT '0.00',
	"commission" numeric(10, 2) DEFAULT '0.00',
	"balance_after" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "att_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"activated_by" integer,
	"employee_id" text,
	"customer_first_name" text NOT NULL,
	"customer_last_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_address" text NOT NULL,
	"customer_city" text NOT NULL,
	"customer_state" text NOT NULL,
	"customer_zip_code" text NOT NULL,
	"iccid" text NOT NULL,
	"sim_type" text NOT NULL,
	"plan_id" integer,
	"plan_name" text NOT NULL,
	"plan_price" numeric(10, 2) NOT NULL,
	"has_international" boolean DEFAULT false,
	"international_countries" jsonb,
	"international_cost" numeric(10, 2) DEFAULT '0.00',
	"has_roaming" boolean DEFAULT false,
	"roaming_regions" jsonb,
	"roaming_cost" numeric(10, 2) DEFAULT '0.00',
	"has_data_addon" boolean DEFAULT false,
	"data_addon_amount" text,
	"data_addon_cost" numeric(10, 2) DEFAULT '0.00',
	"is_port_in" boolean DEFAULT false,
	"port_in_phone_number" text,
	"port_in_carrier" text,
	"port_in_account_number" text,
	"port_in_pin" text,
	"port_in_zip_code" text,
	"has_wifi_calling" boolean DEFAULT false,
	"wifi_emergency_address" text,
	"wifi_emergency_city" text,
	"wifi_emergency_state" text,
	"wifi_emergency_zip_code" text,
	"phone_number" text,
	"total_cost" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"activation_date" timestamp DEFAULT now(),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "att_bulk_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"uploaded_by" integer,
	"employee_id" text,
	"file_name" text NOT NULL,
	"total_records" integer NOT NULL,
	"processed_records" integer DEFAULT 0,
	"successful_activations" integer DEFAULT 0,
	"failed_activations" integer DEFAULT 0,
	"csv_data" jsonb NOT NULL,
	"processing_status" text DEFAULT 'pending' NOT NULL,
	"processing_started" timestamp,
	"processing_completed" timestamp,
	"error_report" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "att_data_addons" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"customer_id" integer,
	"sold_by" integer,
	"employee_id" text,
	"data_amount" text NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"valid_for" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"purchase_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "att_recharges" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"recharged_by" integer,
	"employee_id" text,
	"plan_id" integer,
	"plan_name" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"commission" numeric(10, 2) DEFAULT '0.00',
	"profit" numeric(10, 2) DEFAULT '0.00',
	"status" text DEFAULT 'pending' NOT NULL,
	"recharge_date" timestamp DEFAULT now(),
	"expiry_date" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "att_sim_swaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" text NOT NULL,
	"processed_by" integer,
	"employee_id" text,
	"old_iccid" text NOT NULL,
	"new_iccid" text NOT NULL,
	"new_sim_type" text NOT NULL,
	"reason" text NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"swap_date" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carriers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commission_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "commission_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "commission_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"commission_amount" numeric(10, 2) NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"base_amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commission_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"commission_group_id" integer,
	"plan_id" integer,
	"our_cost" numeric(10, 2) NOT NULL,
	"selling_price" numeric(10, 2) NOT NULL,
	"customer_price" numeric(10, 2),
	"profit" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fund_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" integer,
	"to_user_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "nexitel_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"iccid" text NOT NULL,
	"sim_type" text NOT NULL,
	"carrier" text NOT NULL,
	"plan" text NOT NULL,
	"customer_info" jsonb,
	"status" text NOT NULL,
	"activation_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(20) NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"failure_reason" text
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "plan_performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer,
	"date" timestamp DEFAULT now(),
	"transaction_count" integer DEFAULT 0,
	"revenue" numeric(10, 2) DEFAULT '0.00',
	"profit" numeric(10, 2) DEFAULT '0.00',
	"success_rate" numeric(5, 2) DEFAULT '100.00',
	"average_transaction_value" numeric(10, 2) DEFAULT '0.00'
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"carrier" text NOT NULL,
	"country" text NOT NULL,
	"denomination" text NOT NULL,
	"retailer_price" numeric(10, 2) NOT NULL,
	"customer_price" numeric(10, 2),
	"our_cost" numeric(10, 2) NOT NULL,
	"profit" numeric(10, 2) NOT NULL,
	"service_type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"plan_type" text NOT NULL,
	"description" text,
	"duration_months" integer DEFAULT 1 NOT NULL,
	"is_promotional" boolean DEFAULT false,
	"original_price" numeric(10, 2),
	"discount_percentage" numeric(5, 2),
	"promotional_label" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profit_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"processed_by" integer NOT NULL,
	"employee_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payout_method" text NOT NULL,
	"recipient_details" jsonb,
	"profit_balance_before" numeric(10, 2) NOT NULL,
	"profit_balance_after" numeric(10, 2) NOT NULL,
	"main_balance_before" numeric(10, 2) NOT NULL,
	"main_balance_after" numeric(10, 2) NOT NULL,
	"reference" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"requested_at" timestamp DEFAULT now(),
	"processed_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recharge_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer,
	"user_id" integer,
	"admin_user_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"commission" numeric(10, 2) DEFAULT '0.00',
	"admin_profit" numeric(10, 2) DEFAULT '0.00',
	"user_balance_before" numeric(10, 2) NOT NULL,
	"user_balance_after" numeric(10, 2) NOT NULL,
	"admin_balance_before" numeric(10, 2) NOT NULL,
	"admin_balance_after" numeric(10, 2) NOT NULL,
	"status" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recharge_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"mobile_number" text NOT NULL,
	"iccid" text,
	"country" text NOT NULL,
	"carrier" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"service_fee" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"commission" numeric(10, 2) DEFAULT '0.00',
	"balance_after" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"recharge_type" text NOT NULL,
	"transaction_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "retailer_att_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"can_activate" boolean DEFAULT false,
	"can_recharge" boolean DEFAULT false,
	"can_sim_swap" boolean DEFAULT false,
	"can_sell_data_addons" boolean DEFAULT false,
	"can_port_in" boolean DEFAULT false,
	"can_enable_wifi_calling" boolean DEFAULT false,
	"can_bulk_activate" boolean DEFAULT false,
	"max_daily_activations" integer DEFAULT 100,
	"max_daily_recharges" integer DEFAULT 500,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "retailer_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer_id" integer,
	"document_type" text NOT NULL,
	"file_name" text NOT NULL,
	"original_file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"uploaded_by" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "retailer_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer_id" integer NOT NULL,
	"voip_service_access" boolean DEFAULT false NOT NULL,
	"global_recharge_access" boolean DEFAULT false NOT NULL,
	"usa_recharge_access" boolean DEFAULT false NOT NULL,
	"wallet_funding_access" boolean DEFAULT false NOT NULL,
	"max_daily_funding" numeric(10, 2) DEFAULT '0.00',
	"max_monthly_funding" numeric(10, 2) DEFAULT '0.00',
	"nexitel_activation_access" boolean DEFAULT false NOT NULL,
	"sim_swap_access" boolean DEFAULT false NOT NULL,
	"port_in_access" boolean DEFAULT false NOT NULL,
	"report_access" boolean DEFAULT true NOT NULL,
	"bulk_activation_access" boolean DEFAULT false NOT NULL,
	"custom_limits" text,
	"notes" text,
	"created_by" integer NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "retailer_permissions_retailer_id_unique" UNIQUE("retailer_id")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"permission_id" integer
);
--> statement-breakpoint
CREATE TABLE "saved_numbers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"phone_number" text NOT NULL,
	"label" text NOT NULL,
	"country" text NOT NULL,
	"carrier" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" text NOT NULL,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"is_editable" boolean DEFAULT true,
	"updated_by" integer,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"phone_number" text NOT NULL,
	"country" text NOT NULL,
	"carrier" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"service_fee" numeric(10, 2) NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"balance_after" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_wallet_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"can_add_funds" boolean DEFAULT false NOT NULL,
	"max_daily_funding" numeric(10, 2),
	"max_monthly_funding" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_wallet_permissions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"employee_role" text,
	"employee_id" text,
	"full_name" text,
	"phone_number" text,
	"full_address" text,
	"business_registration_number" text,
	"commission_group_id" integer,
	"balance" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"is_active" boolean DEFAULT true,
	"reset_token" text,
	"reset_token_expiry" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "voip_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"plan_id" integer,
	"voip_number" text NOT NULL,
	"activation_code" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"status" text DEFAULT 'active' NOT NULL,
	"activated_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_email_sent" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "voip_activations_voip_number_unique" UNIQUE("voip_number")
);
--> statement-breakpoint
CREATE TABLE "voip_bulk_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"plan_id" integer,
	"batch_name" text NOT NULL,
	"total_numbers" integer NOT NULL,
	"activated_numbers" integer DEFAULT 0,
	"status" text DEFAULT 'processing' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "voip_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"features" text[],
	"max_users" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_topup_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"method" text NOT NULL,
	"reference" text,
	"balance_before" numeric(10, 2) NOT NULL,
	"balance_after" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"processed_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wifi_calling_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"phone_number" text NOT NULL,
	"plan" text NOT NULL,
	"device_type" text,
	"emergency_address" jsonb,
	"status" text NOT NULL,
	"activation_date" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "activation_records" ADD CONSTRAINT "activation_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_activations" ADD CONSTRAINT "att_activations_activated_by_users_id_fk" FOREIGN KEY ("activated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_activations" ADD CONSTRAINT "att_activations_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_bulk_activations" ADD CONSTRAINT "att_bulk_activations_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_data_addons" ADD CONSTRAINT "att_data_addons_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_data_addons" ADD CONSTRAINT "att_data_addons_sold_by_users_id_fk" FOREIGN KEY ("sold_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_recharges" ADD CONSTRAINT "att_recharges_recharged_by_users_id_fk" FOREIGN KEY ("recharged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_recharges" ADD CONSTRAINT "att_recharges_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "att_sim_swaps" ADD CONSTRAINT "att_sim_swaps_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_history" ADD CONSTRAINT "commission_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_pricing" ADD CONSTRAINT "commission_pricing_commission_group_id_commission_groups_id_fk" FOREIGN KEY ("commission_group_id") REFERENCES "public"."commission_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_pricing" ADD CONSTRAINT "commission_pricing_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_transfers" ADD CONSTRAINT "fund_transfers_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nexitel_activations" ADD CONSTRAINT "nexitel_activations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_performance_metrics" ADD CONSTRAINT "plan_performance_metrics_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profit_payouts" ADD CONSTRAINT "profit_payouts_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recharge_history" ADD CONSTRAINT "recharge_history_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recharge_history" ADD CONSTRAINT "recharge_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recharge_history" ADD CONSTRAINT "recharge_history_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recharge_records" ADD CONSTRAINT "recharge_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_att_permissions" ADD CONSTRAINT "retailer_att_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_documents" ADD CONSTRAINT "retailer_documents_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_documents" ADD CONSTRAINT "retailer_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_permissions" ADD CONSTRAINT "retailer_permissions_retailer_id_users_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_permissions" ADD CONSTRAINT "retailer_permissions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retailer_permissions" ADD CONSTRAINT "retailer_permissions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_numbers" ADD CONSTRAINT "saved_numbers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wallet_permissions" ADD CONSTRAINT "user_wallet_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_commission_group_id_commission_groups_id_fk" FOREIGN KEY ("commission_group_id") REFERENCES "public"."commission_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voip_activations" ADD CONSTRAINT "voip_activations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voip_activations" ADD CONSTRAINT "voip_activations_plan_id_voip_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."voip_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voip_bulk_activations" ADD CONSTRAINT "voip_bulk_activations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voip_bulk_activations" ADD CONSTRAINT "voip_bulk_activations_plan_id_voip_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."voip_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_topup_records" ADD CONSTRAINT "wallet_topup_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_topup_records" ADD CONSTRAINT "wallet_topup_records_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wifi_calling_activations" ADD CONSTRAINT "wifi_calling_activations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;