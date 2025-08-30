import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, jsonb, uuid, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'admin', 'employee', 'retailer'
  employeeRole: text("employee_role"), // 'accountant', 'technical_support', etc.
  employeeId: text("employee_id").unique(), // Required for employees - used for verification
  
  // Retailer profile fields
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  fullAddress: text("full_address"),
  businessRegistrationNumber: text("business_registration_number"),
  
  commissionGroupId: integer("commission_group_id").references(() => commissionGroups.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("is_active").default(true),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  country: text("country").notNull(),
  carrier: text("carrier").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedNumbers = pgTable("saved_numbers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  phoneNumber: text("phone_number").notNull(),
  label: text("label").notNull(),
  country: text("country").notNull(),
  carrier: text("carrier").notNull(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  permissionId: integer("permission_id").references(() => permissions.id),
});

// Plans table for admin-managed pricing
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  carrier: text("carrier").notNull(),
  country: text("country").notNull(),
  denomination: text("denomination").notNull(), // e.g., "$10", "$25", "500MB"
  retailerPrice: decimal("retailer_price", { precision: 10, scale: 2 }).notNull(), // Price charged to retailer
  customerPrice: decimal("customer_price", { precision: 10, scale: 2 }), // Price customer pays to retailer  
  ourCost: decimal("our_cost", { precision: 10, scale: 2 }).notNull(), // Our cost for this plan
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(), // Calculated profit (retailerPrice - ourCost)
  serviceType: text("service_type").notNull(), // "nexitel", "global_recharge", "voip", "att", "nexitel_recharge", "att_recharge"
  isActive: boolean("is_active").default(true),
  planType: text("plan_type").notNull(), // "prepaid", "data", "voice", "unlimited"
  description: text("description"),
  // Multi-month pricing fields
  durationMonths: integer("duration_months").default(1).notNull(),
  isPromotional: boolean("is_promotional").default(false),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  promotionalLabel: text("promotional_label"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Plan performance metrics table
export const planPerformanceMetrics = pgTable("plan_performance_metrics", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => plans.id),
  date: timestamp("date").defaultNow(),
  transactionCount: integer("transaction_count").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  profit: decimal("profit", { precision: 10, scale: 2 }).default("0.00"),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("100.00"), // percentage
  averageTransactionValue: decimal("average_transaction_value", { precision: 10, scale: 2 }).default("0.00"),
});

// Commission groups table
export const commissionGroups = pgTable("commission_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // "Commission Group A", "Commission Group B", etc.
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission pricing table - links groups to specific plan pricing
export const commissionPricing = pgTable("commission_pricing", {
  id: serial("id").primaryKey(),
  commissionGroupId: integer("commission_group_id").references(() => commissionGroups.id),
  planId: integer("plan_id").references(() => plans.id),
  ourCost: decimal("our_cost", { precision: 10, scale: 2 }).notNull(), // What it costs us
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(), // What we sell to retailer for
  customerPrice: decimal("customer_price", { precision: 10, scale: 2 }), // What customer pays to retailer
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(), // Calculated profit (sellingPrice - ourCost)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  transactions: many(transactions),
  savedNumbers: many(savedNumbers),
  commissionGroup: one(commissionGroups, {
    fields: [users.commissionGroupId],
    references: [commissionGroups.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const savedNumbersRelations = relations(savedNumbers, ({ one }) => ({
  user: one(users, {
    fields: [savedNumbers.userId],
    references: [users.id],
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  commissionPricing: many(commissionPricing),
  performanceMetrics: many(planPerformanceMetrics),
}));

export const planPerformanceMetricsRelations = relations(planPerformanceMetrics, ({ one }) => ({
  plan: one(plans, {
    fields: [planPerformanceMetrics.planId],
    references: [plans.id],
  }),
}));

export const commissionGroupsRelations = relations(commissionGroups, ({ many }) => ({
  users: many(users),
  commissionPricing: many(commissionPricing),
}));

export const commissionPricingRelations = relations(commissionPricing, ({ one }) => ({
  commissionGroup: one(commissionGroups, {
    fields: [commissionPricing.commissionGroupId],
    references: [commissionGroups.id],
  }),
  plan: one(plans, {
    fields: [commissionPricing.planId],
    references: [plans.id],
  }),
}));

// AT&T Activations table
export const attActivations = pgTable("att_activations", {
  id: serial("id").primaryKey(),
  activatedBy: integer("activated_by").references(() => users.id),
  employeeId: text("employee_id"), // For employee verification
  // Customer Information
  customerFirstName: text("customer_first_name").notNull(),
  customerLastName: text("customer_last_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerCity: text("customer_city").notNull(),
  customerState: text("customer_state").notNull(),
  customerZipCode: text("customer_zip_code").notNull(),
  // SIM Information
  iccid: text("iccid").notNull(),
  simType: text("sim_type").notNull(), // "physical", "esim"
  // Plan Information
  planId: integer("plan_id").references(() => plans.id),
  planName: text("plan_name").notNull(),
  planPrice: decimal("plan_price", { precision: 10, scale: 2 }).notNull(),
  // International & Roaming Options
  hasInternational: boolean("has_international").default(false),
  internationalCountries: jsonb("international_countries"), // Array of country codes
  internationalCost: decimal("international_cost", { precision: 10, scale: 2 }).default("0.00"),
  hasRoaming: boolean("has_roaming").default(false),
  roamingRegions: jsonb("roaming_regions"), // Array of roaming regions
  roamingCost: decimal("roaming_cost", { precision: 10, scale: 2 }).default("0.00"),
  // Data Add-ons
  hasDataAddon: boolean("has_data_addon").default(false),
  dataAddonAmount: text("data_addon_amount"), // "1GB", "5GB", etc.
  dataAddonCost: decimal("data_addon_cost", { precision: 10, scale: 2 }).default("0.00"),
  // Port-in Information
  isPortIn: boolean("is_port_in").default(false),
  portInPhoneNumber: text("port_in_phone_number"),
  portInCarrier: text("port_in_carrier"),
  portInAccountNumber: text("port_in_account_number"),
  portInPin: text("port_in_pin"),
  portInZipCode: text("port_in_zip_code"),
  // WiFi Calling
  hasWifiCalling: boolean("has_wifi_calling").default(false),
  wifiEmergencyAddress: text("wifi_emergency_address"),
  wifiEmergencyCity: text("wifi_emergency_city"),
  wifiEmergencyState: text("wifi_emergency_state"),
  wifiEmergencyZipCode: text("wifi_emergency_zip_code"),
  // Activation Details
  phoneNumber: text("phone_number"), // Assigned phone number
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed"
  activationDate: timestamp("activation_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AT&T Data Add-ons table (for after-activation purchases)
export const attDataAddons = pgTable("att_data_addons", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  customerId: integer("customer_id").references(() => users.id),
  soldBy: integer("sold_by").references(() => users.id),
  employeeId: text("employee_id"), // For employee verification
  dataAmount: text("data_amount").notNull(), // "1GB", "5GB", etc.
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  validFor: text("valid_for").notNull(), // "30 days", "90 days", etc.
  status: text("status").notNull().default("active"), // "active", "expired", "used"
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

// AT&T SIM Swaps table
export const attSimSwaps = pgTable("att_sim_swaps", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  processedBy: integer("processed_by").references(() => users.id),
  employeeId: text("employee_id"), // For employee verification
  oldIccid: text("old_iccid").notNull(),
  newIccid: text("new_iccid").notNull(),
  newSimType: text("new_sim_type").notNull(), // "physical", "esim"
  reason: text("reason").notNull(), // "damaged", "lost", "upgrade"
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed"
  swapDate: timestamp("swap_date").defaultNow(),
  notes: text("notes"),
});

// AT&T Recharges table
export const attRecharges = pgTable("att_recharges", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  rechargedBy: integer("recharged_by").references(() => users.id),
  employeeId: text("employee_id"), // For employee verification
  planId: integer("plan_id").references(() => plans.id),
  planName: text("plan_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00"),
  profit: decimal("profit", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed"
  rechargeDate: timestamp("recharge_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  notes: text("notes"),
});

// Bulk AT&T Activations table
export const attBulkActivations = pgTable("att_bulk_activations", {
  id: serial("id").primaryKey(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  employeeId: text("employee_id"), // For employee verification
  fileName: text("file_name").notNull(),
  totalRecords: integer("total_records").notNull(),
  processedRecords: integer("processed_records").default(0),
  successfulActivations: integer("successful_activations").default(0),
  failedActivations: integer("failed_activations").default(0),
  csvData: jsonb("csv_data").notNull(), // Store the CSV data
  processingStatus: text("processing_status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  processingStarted: timestamp("processing_started"),
  processingCompleted: timestamp("processing_completed"),
  errorReport: jsonb("error_report"), // Store any errors that occurred
  createdAt: timestamp("created_at").defaultNow(),
});

// Retailer AT&T Permissions table
export const retailerAttPermissions = pgTable("retailer_att_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  canActivate: boolean("can_activate").default(false),
  canRecharge: boolean("can_recharge").default(false),
  canSimSwap: boolean("can_sim_swap").default(false),
  canSellDataAddons: boolean("can_sell_data_addons").default(false),
  canPortIn: boolean("can_port_in").default(false),
  canEnableWifiCalling: boolean("can_enable_wifi_calling").default(false),
  canBulkActivate: boolean("can_bulk_activate").default(false),
  maxDailyActivations: integer("max_daily_activations").default(100),
  maxDailyRecharges: integer("max_daily_recharges").default(500),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  employeeId: z.string().optional(),
  employeeRole: z.string().optional(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertSavedNumberSchema = createInsertSchema(savedNumbers).omit({
  id: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  denomination: z.union([z.string(), z.number()]).transform(val => String(val)),
  ourCost: z.union([z.string(), z.number()]).transform(val => String(val)),
  profit: z.union([z.string(), z.number()]).transform(val => String(val)),
  originalPrice: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform(val => val ? String(val) : null).optional(),
  discountPercentage: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform(val => val ? String(val) : null).optional(),
});

export const insertCommissionGroupSchema = createInsertSchema(commissionGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionPricingSchema = createInsertSchema(commissionPricing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlanPerformanceMetricSchema = createInsertSchema(planPerformanceMetrics).omit({
  id: true,
});

// AT&T Insert Schemas
export const insertAttActivationSchema = createInsertSchema(attActivations).omit({
  id: true,
  createdAt: true,
});

export const insertAttDataAddonSchema = createInsertSchema(attDataAddons).omit({
  id: true,
  purchaseDate: true,
});

export const insertAttSimSwapSchema = createInsertSchema(attSimSwaps).omit({
  id: true,
  swapDate: true,
});

export const insertAttRechargeSchema = createInsertSchema(attRecharges).omit({
  id: true,
  rechargeDate: true,
});

export const insertAttBulkActivationSchema = createInsertSchema(attBulkActivations).omit({
  id: true,
  createdAt: true,
});

export const insertRetailerAttPermissionSchema = createInsertSchema(retailerAttPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AT&T Validation Schemas
export const attActivationSchema = z.object({
  // Customer Information
  customerFirstName: z.string().min(1, "First name is required"),
  customerLastName: z.string().min(1, "Last name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerAddress: z.string().min(1, "Address is required"),
  customerCity: z.string().min(1, "City is required"),
  customerState: z.string().min(1, "State is required"),
  customerZipCode: z.string().min(1, "ZIP code is required"),
  // SIM Information
  iccid: z.string().min(1, "ICCID is required"),
  simType: z.enum(["physical", "esim"]),
  // Plan Information
  planId: z.number().min(1, "Plan selection is required"),
  // International & Roaming Options
  hasInternational: z.boolean().optional().default(false),
  internationalCountries: z.array(z.string()).optional(),
  internationalCost: z.number().min(0).optional().default(0),
  hasRoaming: z.boolean().optional().default(false),
  roamingRegions: z.array(z.string()).optional(),
  roamingCost: z.number().min(0).optional().default(0),
  // Data Add-ons
  hasDataAddon: z.boolean().optional().default(false),
  dataAddonAmount: z.string().optional(),
  dataAddonCost: z.number().min(0).optional().default(0),
  // Port-in Information
  isPortIn: z.boolean().optional().default(false),
  portInPhoneNumber: z.string().optional(),
  portInCarrier: z.string().optional(),
  portInAccountNumber: z.string().optional(),
  portInPin: z.string().optional(),
  portInZipCode: z.string().optional(),
  // WiFi Calling
  hasWifiCalling: z.boolean().optional().default(false),
  wifiEmergencyAddress: z.string().optional(),
  wifiEmergencyCity: z.string().optional(),
  wifiEmergencyState: z.string().optional(),
  wifiEmergencyZipCode: z.string().optional(),
  // Employee verification (required for admin, optional for others)
  employeeId: z.string().optional(),
  // Additional
  notes: z.string().optional(),
});

export const attDataAddonSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  dataAmount: z.string().min(1, "Data amount is required"),
  cost: z.number().min(0, "Cost must be positive"),
  validFor: z.string().min(1, "Validity period is required"),
  employeeId: z.string().optional(),
});

export const attSimSwapSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  oldIccid: z.string().min(1, "Old ICCID is required"),
  newIccid: z.string().min(1, "New ICCID is required"),
  newSimType: z.enum(["physical", "esim"]),
  reason: z.enum(["damaged", "lost", "upgrade"]),
  cost: z.number().min(0, "Cost must be positive"),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
});

export const attRechargeSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  planId: z.number().min(1, "Plan selection is required"),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
});

export const attBulkActivationSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  csvData: z.array(z.object({})).min(1, "CSV data is required"),
  employeeId: z.string().optional(),
});

export const retailerAttPermissionSchema = z.object({
  userId: z.number().min(1, "User ID is required"),
  canActivate: z.boolean().optional().default(false),
  canRecharge: z.boolean().optional().default(false),
  canSimSwap: z.boolean().optional().default(false),
  canSellDataAddons: z.boolean().optional().default(false),
  canPortIn: z.boolean().optional().default(false),
  canEnableWifiCalling: z.boolean().optional().default(false),
  canBulkActivate: z.boolean().optional().default(false),
  maxDailyActivations: z.number().min(1).optional().default(100),
  maxDailyRecharges: z.number().min(1).optional().default(500),
});

export const planManagementSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  carrier: z.string().min(1, "Carrier is required"),
  country: z.string().min(1, "Country is required"),
  denomination: z.union([z.string(), z.number()]).transform(val => {
    // Remove $ sign and convert to string
    const cleanVal = String(val).replace('$', '');
    return cleanVal;
  }),
  ourCost: z.union([z.string(), z.number()]).transform(val => String(val)),
  serviceType: z.enum(["nexitel", "nexitel_recharge", "att_recharge", "global_recharge", "voip", "att"]),
  planType: z.enum(["prepaid", "data", "voice", "unlimited"]),
  description: z.string().optional(),
  durationMonths: z.number().min(1).max(24).optional().default(1),
  isPromotional: z.boolean().optional().default(false),
  originalPrice: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform(val => val ? String(val) : null).optional(),
  discountPercentage: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform(val => val ? String(val) : null).optional(),
  promotionalLabel: z.string().optional(),
});

export const commissionGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

export const commissionPricingSchema = z.object({
  commissionGroupId: z.number().min(1, "Commission group is required"),
  planId: z.number().min(1, "Plan is required"),
  ourCost: z.number().min(0, "Our cost must be positive"),
  sellingPrice: z.number().min(0, "Selling price must be positive"),
}).refine((data) => data.sellingPrice > data.ourCost, {
  message: "Selling price must be greater than our cost",
  path: ["sellingPrice"],
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const rechargeSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  carrier: z.string().min(1, "Carrier is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  employeeId: z.string().min(1, "Employee ID is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertSavedNumber = z.infer<typeof insertSavedNumberSchema>;
export type SavedNumber = typeof savedNumbers.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertCommissionGroup = z.infer<typeof insertCommissionGroupSchema>;
export type CommissionGroup = typeof commissionGroups.$inferSelect;
export type InsertCommissionPricing = z.infer<typeof insertCommissionPricingSchema>;
export type CommissionPricing = typeof commissionPricing.$inferSelect;
export type InsertPlanPerformanceMetric = z.infer<typeof insertPlanPerformanceMetricSchema>;
export type PlanPerformanceMetric = typeof planPerformanceMetrics.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RechargeRequest = z.infer<typeof rechargeSchema>;
export type PlanManagementRequest = z.infer<typeof planManagementSchema>;
export type CommissionGroupRequest = z.infer<typeof commissionGroupSchema>;
export type CommissionPricingRequest = z.infer<typeof commissionPricingSchema>;

// AT&T Types
export type InsertAttActivation = z.infer<typeof insertAttActivationSchema>;
export type AttActivation = typeof attActivations.$inferSelect;
export type InsertAttDataAddon = z.infer<typeof insertAttDataAddonSchema>;
export type AttDataAddon = typeof attDataAddons.$inferSelect;
export type InsertAttSimSwap = z.infer<typeof insertAttSimSwapSchema>;
export type AttSimSwap = typeof attSimSwaps.$inferSelect;
export type InsertAttRecharge = z.infer<typeof insertAttRechargeSchema>;
export type AttRecharge = typeof attRecharges.$inferSelect;
export type InsertAttBulkActivation = z.infer<typeof insertAttBulkActivationSchema>;
export type AttBulkActivation = typeof attBulkActivations.$inferSelect;
export type InsertRetailerAttPermission = z.infer<typeof insertRetailerAttPermissionSchema>;
export type RetailerAttPermission = typeof retailerAttPermissions.$inferSelect;
export type AttActivationRequest = z.infer<typeof attActivationSchema>;
export type AttDataAddonRequest = z.infer<typeof attDataAddonSchema>;
export type AttSimSwapRequest = z.infer<typeof attSimSwapSchema>;
export type AttRechargeRequest = z.infer<typeof attRechargeSchema>;
export type AttBulkActivationRequest = z.infer<typeof attBulkActivationSchema>;
export type RetailerAttPermissionRequest = z.infer<typeof retailerAttPermissionSchema>;

// Password reset schemas
export const forgotUsernameSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type ForgotUsernameRequest = z.infer<typeof forgotUsernameSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

// Employee ID verification schema
export const employeeVerificationSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
});

export type EmployeeVerificationRequest = z.infer<typeof employeeVerificationSchema>;

// Additional comprehensive tables for full system
export const carriers = pgTable("carriers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  type: text("type").notNull(), // "mobile", "landline", "voip"
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // Store additional carrier-specific data
  createdAt: timestamp("created_at").defaultNow(),
});

export const rechargeHistory = pgTable("recharge_history", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").references(() => transactions.id),
  userId: integer("user_id").references(() => users.id),
  adminUserId: integer("admin_user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00"),
  adminProfit: decimal("admin_profit", { precision: 10, scale: 2 }).default("0.00"),
  userBalanceBefore: decimal("user_balance_before", { precision: 10, scale: 2 }).notNull(),
  userBalanceAfter: decimal("user_balance_after", { precision: 10, scale: 2 }).notNull(),
  adminBalanceBefore: decimal("admin_balance_before", { precision: 10, scale: 2 }).notNull(),
  adminBalanceAfter: decimal("admin_balance_after", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "pending", "completed", "failed"
  metadata: jsonb("metadata"), // Store additional transaction data
  createdAt: timestamp("created_at").defaultNow(),
});

export const fundTransfers = pgTable("fund_transfers", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").references(() => users.id),
  toUserId: integer("to_user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  status: text("status").notNull(), // "pending", "completed", "failed"
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const sessionLogs = pgTable("session_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(),
  action: text("action").notNull(), // "login", "logout", "transaction", etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull(), // "string", "number", "boolean", "json"
  description: text("description"),
  isEditable: boolean("is_editable").default(true),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "info", "warning", "error", "success"
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  entityType: text("entity_type").notNull(), // "user", "transaction", "plan", etc.
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // "create", "update", "delete"
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wifiCallingActivations = pgTable("wifi_calling_activations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  plan: text("plan").notNull(),
  deviceType: text("device_type"), // "iOS", "Android", "Desktop"
  emergencyAddress: jsonb("emergency_address"), // Street, city, state, zip
  status: text("status").notNull(), // "pending", "activated", "failed"
  activationDate: timestamp("activation_date"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nexitelActivations = pgTable("nexitel_activations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  iccid: text("iccid").notNull(),
  simType: text("sim_type").notNull(), // "physical", "esim"
  carrier: text("carrier").notNull(), // "nexitel-purple", "nexitel-blue"
  plan: text("plan").notNull(),
  customerInfo: jsonb("customer_info"), // Name, address, etc.
  status: text("status").notNull(), // "pending", "activated", "failed"
  activationDate: timestamp("activation_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// VoIP Activation Tables
export const voipPlans = pgTable("voip_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array(), // Array of feature strings
  maxUsers: integer("max_users").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const voipActivations = pgTable("voip_activations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  planId: integer("plan_id").references(() => voipPlans.id),
  voipNumber: text("voip_number").notNull().unique(),
  activationCode: text("activation_code").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  status: text("status").notNull().default("active"), // 'active', 'suspended', 'cancelled'
  activatedAt: timestamp("activated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isEmailSent: boolean("is_email_sent").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const voipBulkActivations = pgTable("voip_bulk_activations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  planId: integer("plan_id").references(() => voipPlans.id),
  batchName: text("batch_name").notNull(),
  totalNumbers: integer("total_numbers").notNull(),
  activatedNumbers: integer("activated_numbers").default(0),
  status: text("status").notNull().default("processing"), // 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// VoIP Relations
export const voipPlansRelations = relations(voipPlans, ({ many }) => ({
  activations: many(voipActivations),
  bulkActivations: many(voipBulkActivations),
}));

export const voipActivationsRelations = relations(voipActivations, ({ one }) => ({
  user: one(users, {
    fields: [voipActivations.userId],
    references: [users.id],
  }),
  plan: one(voipPlans, {
    fields: [voipActivations.planId],
    references: [voipPlans.id],
  }),
}));

export const voipBulkActivationsRelations = relations(voipBulkActivations, ({ one }) => ({
  user: one(users, {
    fields: [voipBulkActivations.userId],
    references: [users.id],
  }),
  plan: one(voipPlans, {
    fields: [voipBulkActivations.planId],
    references: [voipPlans.id],
  }),
}));

// VoIP Schemas
export const insertVoipPlanSchema = createInsertSchema(voipPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVoipActivationSchema = createInsertSchema(voipActivations).omit({
  id: true,
  createdAt: true,
  activatedAt: true,
});

export const insertVoipBulkActivationSchema = createInsertSchema(voipBulkActivations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const voipActivationSchema = z.object({
  planId: z.number().min(1, "Plan is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
});

export const voipBulkActivationSchema = z.object({
  planId: z.number().min(1, "Plan is required"),
  batchName: z.string().min(1, "Batch name is required"),
  totalNumbers: z.number().min(1, "Total numbers must be greater than 0"),
  customers: z.array(z.object({
    email: z.string().email("Valid email is required"),
    name: z.string().min(1, "Customer name is required"),
    phone: z.string().optional(),
  })),
});

export type InsertVoipPlan = z.infer<typeof insertVoipPlanSchema>;
export type VoipPlan = typeof voipPlans.$inferSelect;
export type InsertVoipActivation = z.infer<typeof insertVoipActivationSchema>;
export type VoipActivation = typeof voipActivations.$inferSelect;
export type InsertVoipBulkActivation = z.infer<typeof insertVoipBulkActivationSchema>;
export type VoipBulkActivation = typeof voipBulkActivations.$inferSelect;
export type VoipActivationRequest = z.infer<typeof voipActivationSchema>;
export type VoipBulkActivationRequest = z.infer<typeof voipBulkActivationSchema>;

// Retailer documents table
export const retailerDocuments = pgTable("retailer_documents", {
  id: serial("id").primaryKey(),
  retailerId: integer("retailer_id").references(() => users.id),
  documentType: text("document_type").notNull(), // 'reseller_agreement', 'reseller_certificate', 'copy_of_ein', 'state_business_certificate', 'retailer_photo_id', 'void_check'
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  filePath: text("file_path").notNull(), // Object storage path
  fileSize: integer("file_size"), // File size in bytes
  mimeType: text("mime_type"),
  uploadedBy: integer("uploaded_by").references(() => users.id), // Who uploaded the document
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'rejected'
  notes: text("notes"), // Admin notes about the document
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const retailerDocumentsRelations = relations(retailerDocuments, ({ one }) => ({
  retailer: one(users, {
    fields: [retailerDocuments.retailerId],
    references: [users.id],
  }),
  uploadedByUser: one(users, {
    fields: [retailerDocuments.uploadedBy],
    references: [users.id],
  }),
}));

export const insertRetailerDocumentSchema = createInsertSchema(retailerDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RetailerDocument = typeof retailerDocuments.$inferSelect;
export type InsertRetailerDocument = z.infer<typeof insertRetailerDocumentSchema>;

// Retailer Permissions Schema for Service Access Control
export const retailerPermissions = pgTable("retailer_permissions", {
  id: serial("id").primaryKey(),
  retailerId: integer("retailer_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  voipServiceAccess: boolean("voip_service_access").notNull().default(false),
  globalRechargeAccess: boolean("global_recharge_access").notNull().default(false),
  usaRechargeAccess: boolean("usa_recharge_access").notNull().default(false),
  walletFundingAccess: boolean("wallet_funding_access").notNull().default(false),
  maxDailyFunding: decimal("max_daily_funding", { precision: 10, scale: 2 }).default("0.00"),
  maxMonthlyFunding: decimal("max_monthly_funding", { precision: 10, scale: 2 }).default("0.00"),
  nexitelActivationAccess: boolean("nexitel_activation_access").notNull().default(false),
  simSwapAccess: boolean("sim_swap_access").notNull().default(false),
  portInAccess: boolean("port_in_access").notNull().default(false),
  reportAccess: boolean("report_access").notNull().default(true), // Default true for basic reports
  bulkActivationAccess: boolean("bulk_activation_access").notNull().default(false),
  customLimits: text("custom_limits"), // JSON string for additional custom permission rules
  notes: text("notes"), // Admin notes about the permissions
  createdBy: integer("created_by").notNull().references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const retailerPermissionsRelations = relations(retailerPermissions, ({ one }) => ({
  retailer: one(users, {
    fields: [retailerPermissions.retailerId],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [retailerPermissions.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [retailerPermissions.updatedBy],
    references: [users.id],
  }),
}));

export const insertRetailerPermissionSchema = createInsertSchema(retailerPermissions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type RetailerPermission = typeof retailerPermissions.$inferSelect;
export type InsertRetailerPermission = z.infer<typeof insertRetailerPermissionSchema>;

// Wallet Payment System
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // "credit_card", "debit_card"
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // "pending", "completed", "failed", "refunded"
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  failureReason: text("failure_reason"),
});

export const userWalletPermissions = pgTable("user_wallet_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  canAddFunds: boolean("can_add_funds").notNull().default(false),
  maxDailyFunding: decimal("max_daily_funding", { precision: 10, scale: 2 }),
  maxMonthlyFunding: decimal("max_monthly_funding", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Relations
export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
}));

export const userWalletPermissionsRelations = relations(userWalletPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userWalletPermissions.userId],
    references: [users.id],
  }),
}));

// Payment Schemas
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertUserWalletPermissionSchema = createInsertSchema(userWalletPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const addFundsSchema = z.object({
  amount: z.number().min(5, "Minimum funding amount is $5").max(5000, "Maximum funding amount is $5000"),
  paymentMethod: z.enum(["credit_card", "debit_card"]),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type UserWalletPermission = typeof userWalletPermissions.$inferSelect;
export type InsertUserWalletPermission = z.infer<typeof insertUserWalletPermissionSchema>;
export type AddFundsRequest = z.infer<typeof addFundsSchema>;

// Activity Tracking Tables for ICCID and Mobile Number Search
export const activationRecords = pgTable("activation_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  iccid: text("iccid").notNull(),
  imei: text("imei"),
  mobileNumber: text("mobile_number"),
  sku: text("sku").notNull(),
  carrier: text("carrier").notNull(), // nexitel_blue, nexitel_purple, global, usa_carrier
  serviceType: text("service_type").notNull(), // nexitel, global_recharge, usa_recharge
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerAddress2: text("customer_address_2"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  email: text("email").notNull(),
  commentsNotes: text("comments_notes"),
  autoRenew: text("auto_renew"),
  dateOfActivation: timestamp("date_of_activation"),
  status: text("status").notNull().default("pending"), // pending, active, failed, suspended
  activationFee: decimal("activation_fee", { precision: 10, scale: 2 }).default("0.00"),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00"),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comprehensive Recharge Records for all types  
export const rechargeRecords = pgTable("recharge_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mobileNumber: text("mobile_number").notNull(),
  iccid: text("iccid"), // Optional for global recharges
  country: text("country").notNull(),
  carrier: text("carrier").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00"),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  rechargeType: text("recharge_type").notNull(), // global, usa_carrier, nexitel
  transactionId: text("transaction_id"), // External transaction ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission tracking for all activities
export const commissionHistory = pgTable("commission_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  entityType: text("entity_type").notNull(), // activation, recharge, topup
  entityId: integer("entity_id").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet topup records for reporting
export const walletTopupRecords = pgTable("wallet_topup_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // card, bank_transfer, check, cash
  reference: text("reference"), // Transaction/check reference
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"), // pending, completed, failed
  processedBy: integer("processed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Profit payout records for admin withdrawals
export const profitPayouts = pgTable("profit_payouts", {
  id: serial("id").primaryKey(),
  processedBy: integer("processed_by").references(() => users.id).notNull(),
  employeeId: text("employee_id").notNull(), // Employee verification required
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payoutMethod: text("payout_method").notNull(), // "wire_transfer", "check", "zelle", "usdt"
  
  // Method-specific details
  recipientDetails: jsonb("recipient_details"), // Method-specific info (bank details, wallet address, etc.)
  
  // Financial tracking
  profitBalanceBefore: decimal("profit_balance_before", { precision: 10, scale: 2 }).notNull(),
  profitBalanceAfter: decimal("profit_balance_after", { precision: 10, scale: 2 }).notNull(),
  mainBalanceBefore: decimal("main_balance_before", { precision: 10, scale: 2 }).notNull(),
  mainBalanceAfter: decimal("main_balance_after", { precision: 10, scale: 2 }).notNull(),
  
  // Transaction details
  reference: text("reference"), // Transaction reference/check number
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed", "cancelled"
  notes: text("notes"),
  
  // Processing timestamps
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertActivationRecordSchema = createInsertSchema(activationRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRechargeRecordSchema = createInsertSchema(rechargeRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionHistorySchema = createInsertSchema(commissionHistory).omit({
  id: true,
  createdAt: true,
});

export const insertWalletTopupRecordSchema = createInsertSchema(walletTopupRecords).omit({
  id: true,
  createdAt: true,
});

export const insertProfitPayoutSchema = createInsertSchema(profitPayouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  requestedAt: true,
  processedAt: true,
  completedAt: true,
  processedBy: true,
  profitBalanceBefore: true,
  profitBalanceAfter: true,
  mainBalanceBefore: true,
  mainBalanceAfter: true,
});

// Activity search schema
export const activitySearchSchema = z.object({
  searchTerm: z.string().min(1, "Search term is required"),
  searchType: z.enum(["iccid", "mobile_number", "email", "customer_name"]),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  serviceType: z.enum(["all", "nexitel", "global_recharge", "usa_recharge"]).default("all"),
  status: z.enum(["all", "active", "pending", "failed", "completed"]).default("all"),
});

// Report generation schemas
export const reportGenerationSchema = z.object({
  reportType: z.enum(["activation", "recharge", "commission", "wallet_topup"]),
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
  userId: z.number().optional(), // For retailer-specific reports
  format: z.enum(["csv", "excel"]).default("csv"),
});

export type ActivationRecord = typeof activationRecords.$inferSelect;
export type InsertActivationRecord = z.infer<typeof insertActivationRecordSchema>;
export type RechargeRecord = typeof rechargeRecords.$inferSelect;
export type InsertRechargeRecord = z.infer<typeof insertRechargeRecordSchema>;
export type CommissionHistory = typeof commissionHistory.$inferSelect;
export type InsertCommissionHistory = z.infer<typeof insertCommissionHistorySchema>;
export type WalletTopupRecord = typeof walletTopupRecords.$inferSelect;
export type InsertWalletTopupRecord = z.infer<typeof insertWalletTopupRecordSchema>;

export type ProfitPayout = typeof profitPayouts.$inferSelect;
export type InsertProfitPayout = z.infer<typeof insertProfitPayoutSchema>;
export type ActivitySearchRequest = z.infer<typeof activitySearchSchema>;
export type ReportGenerationRequest = z.infer<typeof reportGenerationSchema>;
