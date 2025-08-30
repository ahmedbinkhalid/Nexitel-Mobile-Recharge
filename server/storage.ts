import { 
  users, 
  transactions, 
  savedNumbers, 
  permissions, 
  rolePermissions, 
  plans, 
  commissionGroups, 
  commissionPricing,
  voipPlans,
  carriers,
  rechargeHistory,
  fundTransfers,
  sessionLogs,
  systemSettings,
  notifications,
  auditLogs,
  wifiCallingActivations,
  nexitelActivations,
  planPerformanceMetrics,
  activationRecords,
  rechargeRecords,
  commissionHistory,
  walletTopupRecords,
  profitPayouts,
  retailerDocuments,
  type User, 
  type InsertUser, 
  type Transaction, 
  type InsertTransaction,
  type SavedNumber, 
  type InsertSavedNumber,
  type Permission, 
  type InsertPermission,
  type RolePermission, 
  type InsertRolePermission,
  type Plan, 
  type InsertPlan,
  type CommissionGroup, 
  type InsertCommissionGroup,
  type CommissionPricing, 
  type InsertCommissionPricing,
  type PlanPerformanceMetric,
  type InsertPlanPerformanceMetric,
  type ActivationRecord,
  type InsertActivationRecord,
  type RechargeRecord,
  type InsertRechargeRecord,
  type CommissionHistory,
  type InsertCommissionHistory,
  type WalletTopupRecord,
  type InsertWalletTopupRecord,
  type ProfitPayout,
  type InsertProfitPayout,
  type RetailerDocument,
  type InsertRetailerDocument,
  type RetailerPermission,
  type InsertRetailerPermission,
  type ActivitySearchRequest,
  type ReportGenerationRequest,
  retailerPermissions,
  // AT&T Schema imports
  attActivations,
  attDataAddons,
  attSimSwaps,
  attRecharges,
  attBulkActivations,
  retailerAttPermissions,
  type AttActivation,
  type InsertAttActivation,
  type AttDataAddon,
  type InsertAttDataAddon,
  type AttSimSwap,
  type InsertAttSimSwap,
  type AttRecharge,
  type InsertAttRecharge,
  type AttBulkActivation,
  type InsertAttBulkActivation,
  type RetailerAttPermission,
  type InsertRetailerAttPermission
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, sql, gte, lte, like, count, sum } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserBalance(id: number, newBalance: string): Promise<User | undefined>;

  // Transaction Management
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;

  // Saved Numbers
  createSavedNumber(savedNumber: InsertSavedNumber): Promise<SavedNumber>;
  getSavedNumbersByUser(userId: number): Promise<SavedNumber[]>;
  deleteSavedNumber(id: number): Promise<boolean>;

  // Permission Management
  createPermission(permission: InsertPermission): Promise<Permission>;
  getAllPermissions(): Promise<Permission[]>;
  createRolePermission(rolePermission: InsertRolePermission): Promise<RolePermission>;
  getRolePermissions(role: string): Promise<RolePermission[]>;

  // Plan Management
  createPlan(plan: InsertPlan): Promise<Plan>;
  getAllPlans(): Promise<Plan[]>;
  getPlansByServiceType(serviceType: string): Promise<Plan[]>;
  getRetailerPlans(retailerId: number): Promise<Plan[]>;
  getRetailerPlansByServiceType(retailerId: number, serviceType: string): Promise<Plan[]>;
  updatePlan(id: number, updates: Partial<InsertPlan>): Promise<Plan | undefined>;
  deletePlan(id: number): Promise<boolean>;

  // Commission Management
  createCommissionGroup(group: InsertCommissionGroup): Promise<CommissionGroup>;
  getAllCommissionGroups(): Promise<CommissionGroup[]>;
  updateCommissionGroup(id: number, updates: Partial<InsertCommissionGroup>): Promise<CommissionGroup | undefined>;
  deleteCommissionGroup(id: number): Promise<boolean>;

  createCommissionPricing(pricing: InsertCommissionPricing): Promise<CommissionPricing>;
  getCommissionPricingByGroup(groupId: number): Promise<CommissionPricing[]>;
  updateCommissionPricing(id: number, updates: Partial<InsertCommissionPricing>): Promise<CommissionPricing | undefined>;
  deleteCommissionPricing(id: number): Promise<boolean>;

  // Activity Tracking & Search
  createActivationRecord(record: InsertActivationRecord): Promise<ActivationRecord>;
  createRechargeRecord(record: InsertRechargeRecord): Promise<RechargeRecord>;
  createCommissionRecord(record: InsertCommissionHistory): Promise<CommissionHistory>;
  createWalletTopupRecord(record: InsertWalletTopupRecord): Promise<WalletTopupRecord>;
  
  searchActivitiesByICCID(iccid: string): Promise<{
    activations: ActivationRecord[];
    recharges: RechargeRecord[];
  }>;
  searchActivitiesByMobileNumber(mobileNumber: string): Promise<{
    activations: ActivationRecord[];
    recharges: RechargeRecord[];
  }>;
  searchActivities(request: ActivitySearchRequest): Promise<{
    activations: ActivationRecord[];
    recharges: RechargeRecord[];
    total: number;
  }>;

  // Report Generation
  generateActivationReport(request: ReportGenerationRequest): Promise<ActivationRecord[]>;
  generateRechargeReport(request: ReportGenerationRequest): Promise<RechargeRecord[]>;
  generateCommissionReport(request: ReportGenerationRequest): Promise<CommissionHistory[]>;
  generateWalletTopupReport(request: ReportGenerationRequest): Promise<WalletTopupRecord[]>;

  // Advanced Features
  processRechargeTransaction(params: {
    userId: number;
    phoneNumber: string;
    country: string;
    carrier: string;
    amount: string;
    serviceFee: string;
    totalAmount: string;
    status: string;
  }): Promise<{
    transaction: Transaction;
    commission: string;
    userBalanceAfter: string;
    adminBalanceAfter: string;
    adminProfit: string;
  }>;

  transferFunds(fromUserId: number, toUserId: number, amount: string, description?: string): Promise<boolean>;
  getSystemSettings(): Promise<Record<string, any>>;
  updateSystemSetting(key: string, value: string): Promise<boolean>;
  createAuditLog(log: {
    userId: number;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;

  // Retailer Document Management
  createRetailerDocument(insertDoc: InsertRetailerDocument): Promise<RetailerDocument>;
  getRetailerDocuments(retailerId: number): Promise<RetailerDocument[]>;
  updateRetailerDocumentStatus(documentId: number, status: string, notes?: string): Promise<RetailerDocument | undefined>;

  // Retailer Permissions Management
  createRetailerPermission(insertPermission: InsertRetailerPermission): Promise<RetailerPermission>;
  getRetailerPermission(retailerId: number): Promise<RetailerPermission | undefined>;
  getAllRetailerPermissions(): Promise<RetailerPermission[]>;
  updateRetailerPermission(retailerId: number, updates: Partial<InsertRetailerPermission>): Promise<RetailerPermission | undefined>;
  deleteRetailerPermission(retailerId: number): Promise<boolean>;

  // AT&T Services Management
  createAttActivation(insertActivation: InsertAttActivation): Promise<AttActivation>;
  getAttActivation(id: number): Promise<AttActivation | undefined>;
  getAllAttActivations(): Promise<AttActivation[]>;
  getAttActivationsByUser(userId: number): Promise<AttActivation[]>;
  updateAttActivationStatus(id: number, status: string, phoneNumber?: string): Promise<AttActivation | undefined>;
  
  createAttDataAddon(insertAddon: InsertAttDataAddon): Promise<AttDataAddon>;
  getAttDataAddons(phoneNumber: string): Promise<AttDataAddon[]>;
  getAllAttDataAddons(): Promise<AttDataAddon[]>;
  
  createAttSimSwap(insertSwap: InsertAttSimSwap): Promise<AttSimSwap>;
  getAttSimSwap(id: number): Promise<AttSimSwap | undefined>;
  getAllAttSimSwaps(): Promise<AttSimSwap[]>;
  updateAttSimSwapStatus(id: number, status: string): Promise<AttSimSwap | undefined>;
  
  createAttRecharge(insertRecharge: InsertAttRecharge): Promise<AttRecharge>;
  getAttRecharge(id: number): Promise<AttRecharge | undefined>;
  getAllAttRecharges(): Promise<AttRecharge[]>;
  getAttRechargesByUser(userId: number): Promise<AttRecharge[]>;
  updateAttRechargeStatus(id: number, status: string): Promise<AttRecharge | undefined>;
  
  createAttBulkActivation(insertBulk: InsertAttBulkActivation): Promise<AttBulkActivation>;
  getAttBulkActivation(id: number): Promise<AttBulkActivation | undefined>;
  getAllAttBulkActivations(): Promise<AttBulkActivation[]>;
  updateAttBulkActivationStatus(id: number, status: string, report?: any): Promise<AttBulkActivation | undefined>;
  
  createRetailerAttPermission(insertPermission: InsertRetailerAttPermission): Promise<RetailerAttPermission>;
  getRetailerAttPermission(userId: number): Promise<RetailerAttPermission | undefined>;
  getAllRetailerAttPermissions(): Promise<RetailerAttPermission[]>;
  updateRetailerAttPermission(userId: number, updates: Partial<InsertRetailerAttPermission>): Promise<RetailerAttPermission | undefined>;
  deleteRetailerAttPermission(userId: number): Promise<boolean>;

  // Analytics Methods
  getAnalyticsOverview(): Promise<any>;
  getDailyActivationsByCarrier(days: number): Promise<any>;
  getDailyRechargesByCarrier(days: number): Promise<any>;
  generateDailyReport(reportDate: string): Promise<any>;
  generateMonthlyReport(year: number, month: number): Promise<any>;
  
  // Wallet Transaction Reports
  generateDailyWalletReport(reportDate: string): Promise<any>;
  generateMonthlyWalletReport(year: number, month: number): Promise<any>;
  
  // Retailer Activation Reports
  generateDailyRetailerReport(reportDate: string): Promise<any>;
  generateMonthlyRetailerReport(year: number, month: number): Promise<any>;
  
  // Profit Payout Management
  createProfitPayout(insertPayout: InsertProfitPayout): Promise<ProfitPayout>;
  getProfitPayout(id: number): Promise<ProfitPayout | undefined>;
  getProfitPayouts(): Promise<ProfitPayout[]>;
  updateProfitPayoutStatus(id: number, status: string, notes?: string): Promise<ProfitPayout | undefined>;
  calculateTotalProfit(): Promise<number>;
  getTotalBalance(): Promise<number>;
  deductFromMainBalance(amount: number, reason: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role)).orderBy(asc(users.createdAt));
  }

  async updateUserBalance(id: number, newBalance: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Transaction Management
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  // Saved Numbers
  async createSavedNumber(savedNumber: InsertSavedNumber): Promise<SavedNumber> {
    const [newSavedNumber] = await db
      .insert(savedNumbers)
      .values(savedNumber)
      .returning();
    return newSavedNumber;
  }

  async getSavedNumbersByUser(userId: number): Promise<SavedNumber[]> {
    return await db
      .select()
      .from(savedNumbers)
      .where(eq(savedNumbers.userId, userId));
  }

  async deleteSavedNumber(id: number): Promise<boolean> {
    const result = await db.delete(savedNumbers).where(eq(savedNumbers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Permission Management
  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db
      .insert(permissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async createRolePermission(rolePermission: InsertRolePermission): Promise<RolePermission> {
    const [newRolePermission] = await db
      .insert(rolePermissions)
      .values(rolePermission)
      .returning();
    return newRolePermission;
  }

  async getRolePermissions(role: string): Promise<RolePermission[]> {
    return await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.role, role));
  }

  // Plan Management
  async createPlan(plan: InsertPlan): Promise<Plan> {
    const [newPlan] = await db
      .insert(plans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async getAllPlans(): Promise<Plan[]> {
    return await db.select().from(plans).orderBy(asc(plans.createdAt));
  }

  async getPlansByServiceType(serviceType: string): Promise<Plan[]> {
    return await db
      .select()
      .from(plans)
      .where(eq(plans.serviceType, serviceType))
      .orderBy(asc(plans.createdAt));
  }

  async getPlanById(id: number): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan || undefined;
  }

  async getRetailerPlans(retailerId: number): Promise<Plan[]> {
    // Get the retailer's commission group first
    const [user] = await db.select().from(users).where(eq(users.id, retailerId));
    if (!user || !user.commissionGroupId) {
      return []; // Return empty array if no commission group assigned
    }

    // Get plans that have commission pricing for this commission group
    return await db
      .select({
        id: plans.id,
        name: plans.name,
        carrier: plans.carrier,
        country: plans.country,
        denomination: plans.denomination,
        ourCost: commissionPricing.ourCost, // Use commission pricing cost
        retailerPrice: commissionPricing.sellingPrice, // Use commission selling price
        customerPrice: plans.customerPrice, // Include customer price from plan
        profit: sql<string>`(COALESCE(${plans.customerPrice}, ${commissionPricing.sellingPrice}) - ${commissionPricing.sellingPrice})`.as('profit'), // Retailer commission = customer_price - selling_price
        serviceType: plans.serviceType,
        planType: plans.planType,
        description: plans.description,
        isActive: plans.isActive,
        durationMonths: plans.durationMonths,
        isPromotional: plans.isPromotional,
        originalPrice: plans.originalPrice,
        discountPercentage: plans.discountPercentage,
        promotionalLabel: plans.promotionalLabel,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
      })
      .from(plans)
      .innerJoin(commissionPricing, eq(plans.id, commissionPricing.planId))
      .where(eq(commissionPricing.commissionGroupId, user.commissionGroupId))
      .orderBy(asc(plans.createdAt));
  }

  async getRetailerPlansByServiceType(retailerId: number, serviceType: string): Promise<Plan[]> {
    // Get the retailer's commission group first
    const [user] = await db.select().from(users).where(eq(users.id, retailerId));
    if (!user || !user.commissionGroupId) {
      return []; // Return empty array if no commission group assigned
    }

    // Get plans that have commission pricing for this commission group and service type
    return await db
      .select({
        id: plans.id,
        name: plans.name,
        carrier: plans.carrier,
        country: plans.country,
        denomination: plans.denomination,
        ourCost: commissionPricing.ourCost, // Use commission pricing cost
        retailerPrice: commissionPricing.sellingPrice, // Use commission selling price
        customerPrice: plans.customerPrice, // Include customer price from plan
        profit: sql<string>`(COALESCE(${plans.customerPrice}, ${commissionPricing.sellingPrice}) - ${commissionPricing.sellingPrice})`.as('profit'), // Retailer commission = customer_price - selling_price
        serviceType: plans.serviceType,
        planType: plans.planType,
        description: plans.description,
        isActive: plans.isActive,
        durationMonths: plans.durationMonths,
        isPromotional: plans.isPromotional,
        originalPrice: plans.originalPrice,
        discountPercentage: plans.discountPercentage,
        promotionalLabel: plans.promotionalLabel,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
      })
      .from(plans)
      .innerJoin(commissionPricing, eq(plans.id, commissionPricing.planId))
      .where(
        and(
          eq(commissionPricing.commissionGroupId, user.commissionGroupId),
          eq(plans.serviceType, serviceType)
        )
      )
      .orderBy(asc(plans.createdAt));
  }

  async getCommissionPlansByServiceType(commissionGroupId: number, serviceType: string): Promise<Plan[]> {
    // Get plans that have commission pricing for the specified commission group and service type
    return await db
      .select({
        id: plans.id,
        name: plans.name,
        carrier: plans.carrier,
        country: plans.country,
        denomination: plans.denomination,
        ourCost: commissionPricing.ourCost, // Use commission pricing cost
        retailerPrice: commissionPricing.sellingPrice, // Use commission selling price
        customerPrice: plans.customerPrice, // Include customer price from plan
        profit: sql<string>`(COALESCE(${plans.customerPrice}, ${commissionPricing.sellingPrice}) - ${commissionPricing.sellingPrice})`.as('profit'), // Retailer commission = customer_price - selling_price
        serviceType: plans.serviceType,
        planType: plans.planType,
        description: plans.description,
        isActive: plans.isActive,
        durationMonths: plans.durationMonths,
        isPromotional: plans.isPromotional,
        originalPrice: plans.originalPrice,
        discountPercentage: plans.discountPercentage,
        promotionalLabel: plans.promotionalLabel,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
      })
      .from(plans)
      .innerJoin(commissionPricing, eq(plans.id, commissionPricing.planId))
      .where(
        and(
          eq(commissionPricing.commissionGroupId, commissionGroupId),
          eq(plans.serviceType, serviceType)
        )
      )
      .orderBy(asc(plans.createdAt));
  }

  async updatePlan(id: number, updates: Partial<InsertPlan>): Promise<Plan | undefined> {
    const [plan] = await db
      .update(plans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();
    return plan || undefined;
  }

  async deletePlan(id: number): Promise<boolean> {
    try {
      // First delete any commission pricing entries for this plan
      await db.delete(commissionPricing).where(eq(commissionPricing.planId, id));
      
      // Then delete the plan
      const result = await db.delete(plans).where(eq(plans.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // Commission Management
  async createCommissionGroup(group: InsertCommissionGroup): Promise<CommissionGroup> {
    const [newGroup] = await db
      .insert(commissionGroups)
      .values(group)
      .returning();
    return newGroup;
  }

  async getAllCommissionGroups(): Promise<CommissionGroup[]> {
    return await db.select().from(commissionGroups).orderBy(asc(commissionGroups.createdAt));
  }

  async updateCommissionGroup(id: number, updates: Partial<InsertCommissionGroup>): Promise<CommissionGroup | undefined> {
    const [group] = await db
      .update(commissionGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(commissionGroups.id, id))
      .returning();
    return group || undefined;
  }

  async deleteCommissionGroup(id: number): Promise<boolean> {
    const result = await db.delete(commissionGroups).where(eq(commissionGroups.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ===== PLAN PERFORMANCE METHODS =====
  
  async getPlanPerformanceMetrics(planId: number, days: number = 30): Promise<PlanPerformanceMetric[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(planPerformanceMetrics)
      .where(
        and(
          eq(planPerformanceMetrics.planId, planId),
          gte(planPerformanceMetrics.date, startDate)
        )
      )
      .orderBy(asc(planPerformanceMetrics.date));
  }

  async updatePlanPerformanceMetrics(planId: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate sample performance data for demonstration
    const sampleData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      
      const transactionCount = Math.floor(Math.random() * 20) + 5;
      const revenue = (Math.random() * 500 + 100).toFixed(2);
      const profit = (parseFloat(revenue) * 0.2).toFixed(2);
      const averageTransactionValue = (parseFloat(revenue) / transactionCount).toFixed(2);
      
      return {
        planId,
        date,
        transactionCount,
        revenue,
        profit,
        averageTransactionValue,
        successRate: (95 + Math.random() * 5).toFixed(2), // 95-100%
      };
    });

    // Insert sample data
    for (const data of sampleData) {
      const existing = await db
        .select()
        .from(planPerformanceMetrics)
        .where(
          and(
            eq(planPerformanceMetrics.planId, planId),
            eq(planPerformanceMetrics.date, data.date)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(planPerformanceMetrics).values(data);
      }
    }
  }

  async createCommissionPricing(pricing: InsertCommissionPricing): Promise<CommissionPricing> {
    const [newPricing] = await db
      .insert(commissionPricing)
      .values(pricing)
      .returning();
    
    // Also update the plan's customer_price if it's provided in the pricing data
    if (pricing.customerPrice) {
      await db
        .update(plans)
        .set({ customerPrice: pricing.customerPrice })
        .where(eq(plans.id, pricing.planId));
    }
    
    return newPricing;
  }

  async getCommissionPricingByGroup(groupId: number): Promise<CommissionPricing[]> {
    return await db
      .select()
      .from(commissionPricing)
      .where(eq(commissionPricing.commissionGroupId, groupId))
      .orderBy(asc(commissionPricing.createdAt));
  }

  async updateCommissionPricing(id: number, updates: Partial<InsertCommissionPricing>): Promise<CommissionPricing | undefined> {
    const [pricing] = await db
      .update(commissionPricing)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(commissionPricing.id, id))
      .returning();
    return pricing || undefined;
  }

  async getAllCommissionPricing(): Promise<CommissionPricing[]> {
    return await db.select().from(commissionPricing).orderBy(asc(commissionPricing.createdAt));
  }

  async deleteCommissionPricing(id: number): Promise<boolean> {
    const result = await db.delete(commissionPricing).where(eq(commissionPricing.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Advanced Features
  async processRechargeTransaction(params: {
    userId: number;
    phoneNumber: string;
    country: string;
    carrier: string;
    amount: string;
    serviceFee: string;
    totalAmount: string;
    status: string;
  }): Promise<{
    transaction: Transaction;
    commission: string;
    userBalanceAfter: string;
    adminBalanceAfter: string;
    adminProfit: string;
  }> {
    return await db.transaction(async (tx) => {
      // Get user current balance
      const [user] = await tx.select().from(users).where(eq(users.id, params.userId));
      if (!user) throw new Error("User not found");

      const userCurrentBalance = parseFloat(user.balance);
      const totalAmount = parseFloat(params.totalAmount);
      
      if (userCurrentBalance < totalAmount) {
        throw new Error("Insufficient balance");
      }

      // Calculate new balances
      const userBalanceAfter = (userCurrentBalance - totalAmount).toFixed(2);
      
      // Update user balance
      await tx
        .update(users)
        .set({ balance: userBalanceAfter })
        .where(eq(users.id, params.userId));

      // Create transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          ...params,
          balanceAfter: userBalanceAfter,
        })
        .returning();

      // Get admin user
      const [admin] = await tx.select().from(users).where(eq(users.role, "admin"));
      if (!admin) throw new Error("Admin user not found");

      const adminCurrentBalance = parseFloat(admin.balance);
      const commission = (totalAmount * 0.1).toFixed(2); // 10% commission
      const adminProfit = (parseFloat(params.serviceFee) - parseFloat(commission)).toFixed(2);
      const adminBalanceAfter = (adminCurrentBalance + parseFloat(adminProfit)).toFixed(2);

      // Update admin balance
      await tx
        .update(users)
        .set({ balance: adminBalanceAfter })
        .where(eq(users.id, admin.id));

      // Record recharge history
      await tx
        .insert(rechargeHistory)
        .values({
          transactionId: transaction.id,
          userId: params.userId,
          adminUserId: admin.id,
          amount: params.amount,
          commission,
          adminProfit,
          userBalanceBefore: user.balance,
          userBalanceAfter,
          adminBalanceBefore: admin.balance,
          adminBalanceAfter,
          status: params.status,
          metadata: { originalParams: params },
        });

      return {
        transaction,
        commission,
        userBalanceAfter,
        adminBalanceAfter,
        adminProfit,
      };
    });
  }

  async transferFunds(fromUserId: number, toUserId: number, amount: string, description?: string): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const transferAmount = parseFloat(amount);

      // Get source user
      const [fromUser] = await tx.select().from(users).where(eq(users.id, fromUserId));
      if (!fromUser || parseFloat(fromUser.balance) < transferAmount) {
        return false;
      }

      // Get destination user
      const [toUser] = await tx.select().from(users).where(eq(users.id, toUserId));
      if (!toUser) return false;

      // Update balances
      const newFromBalance = (parseFloat(fromUser.balance) - transferAmount).toFixed(2);
      const newToBalance = (parseFloat(toUser.balance) + transferAmount).toFixed(2);

      await tx
        .update(users)
        .set({ balance: newFromBalance })
        .where(eq(users.id, fromUserId));

      await tx
        .update(users)
        .set({ balance: newToBalance })
        .where(eq(users.id, toUserId));

      // Record transfer
      await tx
        .insert(fundTransfers)
        .values({
          fromUserId,
          toUserId,
          amount,
          description: description || "Fund transfer",
          status: "completed",
          processedAt: new Date(),
        });

      return true;
    });
  }

  async getSystemSettings(): Promise<Record<string, any>> {
    const settings = await db.select().from(systemSettings);
    const result: Record<string, any> = {};
    
    for (const setting of settings) {
      switch (setting.type) {
        case "number":
          result[setting.key] = parseFloat(setting.value);
          break;
        case "boolean":
          result[setting.key] = setting.value === "true";
          break;
        case "json":
          result[setting.key] = JSON.parse(setting.value);
          break;
        default:
          result[setting.key] = setting.value;
      }
    }
    
    return result;
  }

  async updateSystemSetting(key: string, value: string): Promise<boolean> {
    const result = await db
      .update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key));
    
    return (result.rowCount ?? 0) > 0;
  }

  async createAuditLog(log: {
    userId: number;
    entityType: string;
    entityId: string;
    action: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await db
      .insert(auditLogs)
      .values({
        ...log,
        oldValues: log.oldValues ? JSON.stringify(log.oldValues) : null,
        newValues: log.newValues ? JSON.stringify(log.newValues) : null,
      });
  }

  // Activity Tracking & Search Implementation
  async createActivationRecord(record: InsertActivationRecord): Promise<ActivationRecord> {
    const [activation] = await db
      .insert(activationRecords)
      .values(record)
      .returning();
    return activation;
  }

  async createRechargeRecord(record: InsertRechargeRecord): Promise<RechargeRecord> {
    const [recharge] = await db
      .insert(rechargeRecords)
      .values(record)
      .returning();
    return recharge;
  }

  async createCommissionRecord(record: InsertCommissionHistory): Promise<CommissionHistory> {
    const [commission] = await db
      .insert(commissionHistory)
      .values(record)
      .returning();
    return commission;
  }

  async createWalletTopupRecord(record: InsertWalletTopupRecord): Promise<WalletTopupRecord> {
    const [topup] = await db
      .insert(walletTopupRecords)
      .values(record)
      .returning();
    return topup;
  }

  async searchActivitiesByICCID(iccid: string): Promise<{
    activations: any[];
    recharges: any[];
  }> {
    const [activations, recharges] = await Promise.all([
      db.select().from(nexitelActivations)
        .where(eq(nexitelActivations.iccid, iccid))
        .orderBy(desc(nexitelActivations.createdAt)),
      db.select({
        id: rechargeHistory.id,
        amount: rechargeHistory.amount,
        commission: rechargeHistory.commission,
        status: rechargeHistory.status,
        createdAt: rechargeHistory.createdAt,
        metadata: rechargeHistory.metadata
      }).from(rechargeHistory)
        .where(sql`${rechargeHistory.metadata}->>'iccid' = ${iccid}`)
        .orderBy(desc(rechargeHistory.createdAt))
    ]);

    return { activations: activations || [], recharges: recharges || [] };
  }

  async searchActivitiesByMobileNumber(mobileNumber: string): Promise<{
    activations: any[];
    recharges: any[];
  }> {
    // Clean the phone number (remove any formatting)
    const cleanNumber = mobileNumber.replace(/[\s\-\(\)]/g, '');
    
    const [activations, recharges] = await Promise.all([
      db.select().from(nexitelActivations)
        .where(sql`REGEXP_REPLACE(${nexitelActivations.customerInfo}->>'phone', '[\\s\\-\\(\\)]', '', 'g') = ${cleanNumber}`)
        .orderBy(desc(nexitelActivations.createdAt)),
      db.select({
        id: rechargeHistory.id,
        amount: rechargeHistory.amount,
        commission: rechargeHistory.commission,
        status: rechargeHistory.status,
        createdAt: rechargeHistory.createdAt,
        metadata: rechargeHistory.metadata
      }).from(rechargeHistory)
        .where(sql`REGEXP_REPLACE(${rechargeHistory.metadata}->>'phone', '[\\s\\-\\(\\)]', '', 'g') = ${cleanNumber}`)
        .orderBy(desc(rechargeHistory.createdAt))
    ]);

    return { activations: activations || [], recharges: recharges || [] };
  }

  async searchActivities(request: ActivitySearchRequest): Promise<{
    activations: ActivationRecord[];
    recharges: RechargeRecord[];
    total: number;
  }> {
    let activationQuery = db.select().from(activationRecords);
    let rechargeQuery = db.select().from(rechargeRecords);

    // Apply search filters
    switch (request.searchType) {
      case 'iccid':
        activationQuery = activationQuery.where(ilike(activationRecords.iccid, `%${request.searchTerm}%`));
        rechargeQuery = rechargeQuery.where(ilike(rechargeRecords.iccid, `%${request.searchTerm}%`));
        break;
      case 'mobile_number':
        activationQuery = activationQuery.where(ilike(activationRecords.mobileNumber, `%${request.searchTerm}%`));
        rechargeQuery = rechargeQuery.where(ilike(rechargeRecords.mobileNumber, `%${request.searchTerm}%`));
        break;
      case 'email':
        activationQuery = activationQuery.where(ilike(activationRecords.email, `%${request.searchTerm}%`));
        break;
      case 'customer_name':
        activationQuery = activationQuery.where(ilike(activationRecords.customerName, `%${request.searchTerm}%`));
        break;
    }

    // Apply date filters
    if (request.dateFrom) {
      const fromDate = new Date(request.dateFrom);
      activationQuery = activationQuery.where(gte(activationRecords.createdAt, fromDate));
      rechargeQuery = rechargeQuery.where(gte(rechargeRecords.createdAt, fromDate));
    }

    // Apply service type filter
    if (request.serviceType !== 'all') {
      activationQuery = activationQuery.where(eq(activationRecords.serviceType, request.serviceType));
      rechargeQuery = rechargeQuery.where(eq(rechargeRecords.rechargeType, request.serviceType));
    }

    // Apply status filter
    if (request.status !== 'all') {
      activationQuery = activationQuery.where(eq(activationRecords.status, request.status));
      rechargeQuery = rechargeQuery.where(eq(rechargeRecords.status, request.status));
    }

    // Execute queries
    const [activations, recharges] = await Promise.all([
      activationQuery.orderBy(desc(activationRecords.createdAt)),
      rechargeQuery.orderBy(desc(rechargeRecords.createdAt))
    ]);

    return {
      activations: activations || [],
      recharges: recharges || [],
      total: (activations?.length || 0) + (recharges?.length || 0)
    };
  }

  async getAllNexitelActivations(): Promise<NexitelActivation[]> {
    const result = await db.select().from(nexitelActivations).orderBy(desc(nexitelActivations.createdAt));
    return result;
  }

  async getNexitelActivationsByUser(userId: number): Promise<NexitelActivation[]> {
    const result = await db.select().from(nexitelActivations)
      .where(eq(nexitelActivations.userId, userId))
      .orderBy(desc(nexitelActivations.createdAt));
    return result;
  }

  async generateActivationReport(request: ReportGenerationRequest): Promise<ActivationRecord[]> {
    let query = db.select().from(activationRecords);

    // Apply date range
    const fromDate = new Date(request.dateFrom);
    const toDate = new Date(request.dateTo);
    query = query.where(
      and(
        gte(activationRecords.createdAt, fromDate),
        gte(toDate, activationRecords.createdAt)
      )
    );

    // Apply user filter for retailer reports
    if (request.userId) {
      query = query.where(eq(activationRecords.userId, request.userId));
    }

    const results = await query.orderBy(desc(activationRecords.createdAt));
    return results || [];
  }

  async generateRechargeReport(request: ReportGenerationRequest): Promise<RechargeRecord[]> {
    let query = db.select().from(rechargeRecords);

    // Apply date range
    const fromDate = new Date(request.dateFrom);
    const toDate = new Date(request.dateTo);
    query = query.where(
      and(
        gte(rechargeRecords.createdAt, fromDate),
        gte(toDate, rechargeRecords.createdAt)
      )
    );

    // Apply user filter for retailer reports
    if (request.userId) {
      query = query.where(eq(rechargeRecords.userId, request.userId));
    }

    const results = await query.orderBy(desc(rechargeRecords.createdAt));
    return results || [];
  }

  async generateCommissionReport(request: ReportGenerationRequest): Promise<CommissionHistory[]> {
    let query = db.select().from(commissionHistory);

    // Apply date range
    const fromDate = new Date(request.dateFrom);
    const toDate = new Date(request.dateTo);
    query = query.where(
      and(
        gte(commissionHistory.createdAt, fromDate),
        gte(toDate, commissionHistory.createdAt)
      )
    );

    // Apply user filter for retailer reports
    if (request.userId) {
      query = query.where(eq(commissionHistory.userId, request.userId));
    }

    const results = await query.orderBy(desc(commissionHistory.createdAt));
    return results || [];
  }

  async generateWalletTopupReport(request: ReportGenerationRequest): Promise<WalletTopupRecord[]> {
    let query = db.select().from(walletTopupRecords);

    // Apply date range
    const fromDate = new Date(request.dateFrom);
    const toDate = new Date(request.dateTo);
    query = query.where(
      and(
        gte(walletTopupRecords.createdAt, fromDate),
        gte(toDate, walletTopupRecords.createdAt)
      )
    );

    // Apply user filter for retailer reports
    if (request.userId) {
      query = query.where(eq(walletTopupRecords.userId, request.userId));
    }

    const results = await query.orderBy(desc(walletTopupRecords.createdAt));
    return results || [];
  }

  // Retailer Document Management
  async createRetailerDocument(insertDoc: InsertRetailerDocument): Promise<RetailerDocument> {
    const [document] = await db
      .insert(retailerDocuments)
      .values(insertDoc)
      .returning();
    return document;
  }

  async getRetailerDocuments(retailerId: number): Promise<RetailerDocument[]> {
    return await db
      .select()
      .from(retailerDocuments)
      .where(eq(retailerDocuments.retailerId, retailerId))
      .orderBy(desc(retailerDocuments.createdAt));
  }

  async updateRetailerDocumentStatus(documentId: number, status: string, notes?: string): Promise<RetailerDocument | undefined> {
    const [document] = await db
      .update(retailerDocuments)
      .set({
        status,
        notes,
        updatedAt: new Date(),
      })
      .where(eq(retailerDocuments.id, documentId))
      .returning();
    return document || undefined;
  }

  // Retailer Permissions Management
  async createRetailerPermission(insertPermission: InsertRetailerPermission): Promise<RetailerPermission> {
    const [permission] = await db
      .insert(retailerPermissions)
      .values(insertPermission)
      .returning();
    return permission;
  }

  async getRetailerPermission(retailerId: number): Promise<RetailerPermission | undefined> {
    const [permission] = await db
      .select()
      .from(retailerPermissions)
      .where(eq(retailerPermissions.retailerId, retailerId));
    return permission || undefined;
  }

  async getAllRetailerPermissions(): Promise<RetailerPermission[]> {
    const permissions = await db
      .select()
      .from(retailerPermissions)
      .orderBy(asc(retailerPermissions.retailerId));
    return permissions;
  }

  async updateRetailerPermission(retailerId: number, updates: Partial<InsertRetailerPermission>): Promise<RetailerPermission | undefined> {
    const [permission] = await db
      .update(retailerPermissions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(retailerPermissions.retailerId, retailerId))
      .returning();
    return permission || undefined;
  }

  async deleteRetailerPermission(retailerId: number): Promise<boolean> {
    const result = await db
      .delete(retailerPermissions)
      .where(eq(retailerPermissions.retailerId, retailerId));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // AT&T Services Management Implementation
  async createAttActivation(insertActivation: InsertAttActivation): Promise<AttActivation> {
    const [activation] = await db
      .insert(attActivations)
      .values(insertActivation)
      .returning();
    return activation;
  }

  async getAttActivation(id: number): Promise<AttActivation | undefined> {
    const [activation] = await db
      .select()
      .from(attActivations)
      .where(eq(attActivations.id, id));
    return activation || undefined;
  }

  async getAllAttActivations(): Promise<AttActivation[]> {
    return await db
      .select()
      .from(attActivations)
      .orderBy(desc(attActivations.activationDate));
  }

  async getAttActivationsByUser(userId: number): Promise<AttActivation[]> {
    return await db
      .select()
      .from(attActivations)
      .where(eq(attActivations.activatedBy, userId))
      .orderBy(desc(attActivations.activationDate));
  }

  async updateAttActivationStatus(id: number, status: string, phoneNumber?: string): Promise<AttActivation | undefined> {
    const updates: any = { status };
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    const [activation] = await db
      .update(attActivations)
      .set(updates)
      .where(eq(attActivations.id, id))
      .returning();
    return activation || undefined;
  }

  async createAttDataAddon(insertAddon: InsertAttDataAddon): Promise<AttDataAddon> {
    const [addon] = await db
      .insert(attDataAddons)
      .values(insertAddon)
      .returning();
    return addon;
  }

  async getAttDataAddons(phoneNumber: string): Promise<AttDataAddon[]> {
    return await db
      .select()
      .from(attDataAddons)
      .where(eq(attDataAddons.phoneNumber, phoneNumber))
      .orderBy(desc(attDataAddons.purchaseDate));
  }

  async getAllAttDataAddons(): Promise<AttDataAddon[]> {
    return await db
      .select()
      .from(attDataAddons)
      .orderBy(desc(attDataAddons.purchaseDate));
  }

  async createAttSimSwap(insertSwap: InsertAttSimSwap): Promise<AttSimSwap> {
    const [swap] = await db
      .insert(attSimSwaps)
      .values(insertSwap)
      .returning();
    return swap;
  }

  async getAttSimSwap(id: number): Promise<AttSimSwap | undefined> {
    const [swap] = await db
      .select()
      .from(attSimSwaps)
      .where(eq(attSimSwaps.id, id));
    return swap || undefined;
  }

  async getAllAttSimSwaps(): Promise<AttSimSwap[]> {
    return await db
      .select()
      .from(attSimSwaps)
      .orderBy(desc(attSimSwaps.swapDate));
  }

  async updateAttSimSwapStatus(id: number, status: string): Promise<AttSimSwap | undefined> {
    const [swap] = await db
      .update(attSimSwaps)
      .set({ status })
      .where(eq(attSimSwaps.id, id))
      .returning();
    return swap || undefined;
  }

  async createAttRecharge(insertRecharge: InsertAttRecharge): Promise<AttRecharge> {
    const [recharge] = await db
      .insert(attRecharges)
      .values(insertRecharge)
      .returning();
    return recharge;
  }

  async getAttRecharge(id: number): Promise<AttRecharge | undefined> {
    const [recharge] = await db
      .select()
      .from(attRecharges)
      .where(eq(attRecharges.id, id));
    return recharge || undefined;
  }

  async getAllAttRecharges(): Promise<AttRecharge[]> {
    return await db
      .select()
      .from(attRecharges)
      .orderBy(desc(attRecharges.rechargeDate));
  }

  async getAttRechargesByUser(userId: number): Promise<AttRecharge[]> {
    return await db
      .select()
      .from(attRecharges)
      .where(eq(attRecharges.rechargedBy, userId))
      .orderBy(desc(attRecharges.rechargeDate));
  }

  async updateAttRechargeStatus(id: number, status: string): Promise<AttRecharge | undefined> {
    const [recharge] = await db
      .update(attRecharges)
      .set({ status })
      .where(eq(attRecharges.id, id))
      .returning();
    return recharge || undefined;
  }

  async createAttBulkActivation(insertBulk: InsertAttBulkActivation): Promise<AttBulkActivation> {
    const [bulk] = await db
      .insert(attBulkActivations)
      .values(insertBulk)
      .returning();
    return bulk;
  }

  async getAttBulkActivation(id: number): Promise<AttBulkActivation | undefined> {
    const [bulk] = await db
      .select()
      .from(attBulkActivations)
      .where(eq(attBulkActivations.id, id));
    return bulk || undefined;
  }

  async getAllAttBulkActivations(): Promise<AttBulkActivation[]> {
    return await db
      .select()
      .from(attBulkActivations)
      .orderBy(desc(attBulkActivations.createdAt));
  }

  async updateAttBulkActivationStatus(id: number, status: string, report?: any): Promise<AttBulkActivation | undefined> {
    const updates: any = { processingStatus: status };
    if (report) updates.errorReport = report;
    if (status === 'processing') updates.processingStarted = new Date();
    if (status === 'completed' || status === 'failed') updates.processingCompleted = new Date();

    const [bulk] = await db
      .update(attBulkActivations)
      .set(updates)
      .where(eq(attBulkActivations.id, id))
      .returning();
    return bulk || undefined;
  }

  async createRetailerAttPermission(insertPermission: InsertRetailerAttPermission): Promise<RetailerAttPermission> {
    const [permission] = await db
      .insert(retailerAttPermissions)
      .values(insertPermission)
      .returning();
    return permission;
  }

  async getRetailerAttPermission(userId: number): Promise<RetailerAttPermission | undefined> {
    const [permission] = await db
      .select()
      .from(retailerAttPermissions)
      .where(eq(retailerAttPermissions.userId, userId));
    return permission || undefined;
  }

  async getAllRetailerAttPermissions(): Promise<RetailerAttPermission[]> {
    return await db
      .select()
      .from(retailerAttPermissions)
      .orderBy(asc(retailerAttPermissions.userId));
  }

  async updateRetailerAttPermission(userId: number, updates: Partial<InsertRetailerAttPermission>): Promise<RetailerAttPermission | undefined> {
    const [permission] = await db
      .update(retailerAttPermissions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(retailerAttPermissions.userId, userId))
      .returning();
    return permission || undefined;
  }

  async deleteRetailerAttPermission(userId: number): Promise<boolean> {
    const result = await db
      .delete(retailerAttPermissions)
      .where(eq(retailerAttPermissions.userId, userId));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // ===== ANALYTICS METHODS =====

  async getAnalyticsOverview(): Promise<any> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Get total users by role
      const totalUsers = await db.select().from(users);
      const adminCount = totalUsers.filter(u => u.role === 'admin').length;
      const employeeCount = totalUsers.filter(u => u.role === 'employee').length;
      const retailerCount = totalUsers.filter(u => u.role === 'retailer').length;

      let totalActivationsToday = 0;
      let totalRechargesTotal = 0;
      let totalRevenue = "0.00";

      // Safely get today's activations
      try {
        const todayActivations = await db
          .select()
          .from(activationRecords)
          .where(gte(activationRecords.createdAt, startOfDay));
        totalActivationsToday += todayActivations.length;
      } catch (error: any) {
        console.log("activationRecords table not ready:", error?.message || error);
      }

      // Safely get today's recharges
      try {
        const todayRecharges = await db
          .select()
          .from(rechargeRecords)
          .where(gte(rechargeRecords.createdAt, startOfDay));
        totalRechargesTotal = todayRecharges.length;

        // Calculate revenue
        const revenueResult = await db
          .select({
            total: sql<string>`COALESCE(SUM(CAST(${rechargeRecords.totalAmount} AS DECIMAL)), 0)`
          })
          .from(rechargeRecords);
        totalRevenue = revenueResult[0]?.total || "0.00";
      } catch (error: any) {
        console.log("rechargeRecords table not ready:", error?.message || error);
      }

      // Safely get AT&T activations today
      try {
        const todayAttActivations = await db
          .select()
          .from(attActivations)
          .where(gte(attActivations.createdAt, startOfDay));
        totalActivationsToday += todayAttActivations.length;
      } catch (error: any) {
        console.log("attActivations table not ready:", error?.message || error);
      }

      return {
        totalUsers: totalUsers.length,
        adminCount,
        employeeCount,
        retailerCount,
        totalActivationsToday,
        totalRechargesTotal,
        totalRevenue,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error("Analytics overview error:", error);
      // Return safe defaults
      return {
        totalUsers: 0,
        adminCount: 0,
        employeeCount: 0,
        retailerCount: 0,
        totalActivationsToday: 0,
        totalRechargesTotal: 0,
        totalRevenue: "0.00",
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getDailyActivationsByCarrier(days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      let allActivations: any[] = [];

      // Safely get Nexitel activations (Blue and Purple)
      try {
        const nexitelActivations = await db
          .select({
            date: sql<string>`DATE(${activationRecords.createdAt})`,
            carrier: activationRecords.carrier,
            count: sql<number>`COUNT(*)`
          })
          .from(activationRecords)
          .where(
            and(
              gte(activationRecords.createdAt, startDate),
              eq(activationRecords.serviceType, 'nexitel')
            )
          )
          .groupBy(sql`DATE(${activationRecords.createdAt})`, activationRecords.carrier)
          .orderBy(sql`DATE(${activationRecords.createdAt})`);
        allActivations.push(...nexitelActivations);
      } catch (error: any) {
        console.log("activationRecords table not ready for Nexitel:", error?.message || error);
      }

      // Safely get AT&T activations
      try {
        const attActivationsData = await db
          .select({
            date: sql<string>`DATE(${attActivations.createdAt})`,
            carrier: sql<string>`'AT&T'`,
            count: sql<number>`COUNT(*)`
          })
          .from(attActivations)
          .where(gte(attActivations.createdAt, startDate))
          .groupBy(sql`DATE(${attActivations.createdAt})`)
          .orderBy(sql`DATE(${attActivations.createdAt})`);
        allActivations.push(...attActivationsData);
      } catch (error: any) {
        console.log("attActivations table not ready:", error?.message || error);
      }
      
      // Create a map for easier processing
      const dailyData: { [key: string]: { [carrier: string]: number } } = {};
      
      // Initialize all days with zero counts
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = {
          'Nexitel Blue': 0,
          'Nexitel Purple': 0,
          'AT&T': 0
        };
      }

      // Fill in actual data
      allActivations.forEach(activation => {
        const dateStr = activation.date;
        if (dailyData[dateStr]) {
          const carrierName = activation.carrier === 'nexitel_blue' ? 'Nexitel Blue' :
                             activation.carrier === 'nexitel_purple' ? 'Nexitel Purple' :
                             activation.carrier;
          dailyData[dateStr][carrierName] = activation.count;
        }
      });

      return Object.entries(dailyData).map(([date, carriers]) => ({
        date,
        ...carriers
      }));
    } catch (error) {
      console.error("Daily activations analytics error:", error);
      // Return empty data with proper structure
      const dailyData: { [key: string]: { [carrier: string]: number } } = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - days + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = {
          'Nexitel Blue': 0,
          'Nexitel Purple': 0,
          'AT&T': 0
        };
      }
      return Object.entries(dailyData).map(([date, carriers]) => ({
        date,
        ...carriers
      }));
    }
  }

  async getDailyRechargesByCarrier(days: number = 7): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      let allRecharges: any[] = [];

      // Safely get recharge data from transactions table (for Global Recharge and USA Carriers)
      try {
        const globalRecharges = await db
          .select({
            date: sql<string>`DATE(${transactions.createdAt})`,
            carrier: transactions.carrier,
            count: sql<number>`COUNT(*)`
          })
          .from(transactions)
          .where(gte(transactions.createdAt, startDate))
          .groupBy(sql`DATE(${transactions.createdAt})`, transactions.carrier)
          .orderBy(sql`DATE(${transactions.createdAt})`);
        allRecharges.push(...globalRecharges);
      } catch (error: any) {
        console.log("transactions table not ready for global recharges:", error?.message || error);
      }

      // Safely get Nexitel recharges
      try {
        const nexitelRecharges = await db
          .select({
            date: sql<string>`DATE(${rechargeRecords.createdAt})`,
            carrier: rechargeRecords.carrier,
            count: sql<number>`COUNT(*)`
          })
          .from(rechargeRecords)
          .where(
            and(
              gte(rechargeRecords.createdAt, startDate),
              eq(rechargeRecords.rechargeType, 'nexitel')
            )
          )
          .groupBy(sql`DATE(${rechargeRecords.createdAt})`, rechargeRecords.carrier)
          .orderBy(sql`DATE(${rechargeRecords.createdAt})`);
        allRecharges.push(...nexitelRecharges);
      } catch (error: any) {
        console.log("rechargeRecords table not ready for Nexitel:", error?.message || error);
      }

      // Safely get AT&T recharges
      try {
        const attRechargesData = await db
          .select({
            date: sql<string>`DATE(${attRecharges.createdAt})`,
            carrier: sql<string>`'AT&T'`,
            count: sql<number>`COUNT(*)`
          })
          .from(attRecharges)
          .where(gte(attRecharges.createdAt, startDate))
          .groupBy(sql`DATE(${attRecharges.createdAt})`)
          .orderBy(sql`DATE(${attRecharges.createdAt})`);
        allRecharges.push(...attRechargesData);
      } catch (error: any) {
        console.log("attRecharges table not ready:", error?.message || error);
      }
      
      // Create a map for easier processing
      const dailyData: { [key: string]: { [carrier: string]: number } } = {};
      
      // Initialize all days with zero counts for main carriers
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = {
          'Nexitel Blue': 0,
          'Nexitel Purple': 0,
          'AT&T': 0,
          'Global Recharge': 0,
          'USA Carriers': 0
        };
      }

      // Fill in actual data
      allRecharges.forEach(recharge => {
        const dateStr = recharge.date;
        if (dailyData[dateStr]) {
          let carrierKey = recharge.carrier;
          
          // Map carrier names to display names
          if (recharge.carrier === 'nexitel_blue') {
            carrierKey = 'Nexitel Blue';
          } else if (recharge.carrier === 'nexitel_purple') {
            carrierKey = 'Nexitel Purple';
          } else if (recharge.carrier === 'AT&T') {
            carrierKey = 'AT&T';
          } else if (recharge.carrier.includes('USA') || ['Verizon', 'T-Mobile', 'Sprint'].includes(recharge.carrier)) {
            carrierKey = 'USA Carriers';
          } else {
            carrierKey = 'Global Recharge';
          }
          
          if (dailyData[dateStr][carrierKey] !== undefined) {
            dailyData[dateStr][carrierKey] += recharge.count;
          }
        }
      });

      return Object.entries(dailyData).map(([date, carriers]) => ({
        date,
        ...carriers
      }));
    } catch (error) {
      console.error("Daily recharges analytics error:", error);
      // Return empty data with proper structure
      const dailyData: { [key: string]: { [carrier: string]: number } } = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - days + i);
        const dateStr = date.toISOString().split('T')[0];
        dailyData[dateStr] = {
          'Nexitel Blue': 0,
          'Nexitel Purple': 0,
          'AT&T': 0,
          'Global Recharge': 0,
          'USA Carriers': 0
        };
      }
      return Object.entries(dailyData).map(([date, carriers]) => ({
        date,
        ...carriers
      }));
    }
  }

  // Generate comprehensive daily report data for download
  async generateDailyReport(reportDate: string): Promise<any> {
    try {
      const startDate = new Date(reportDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(reportDate);
      endDate.setHours(23, 59, 59, 999);

      const report = {
        reportDate,
        reportType: 'Daily',
        generatedAt: new Date().toISOString(),
        summary: {
          totalActivations: 0,
          totalRecharges: 0,
          totalRevenue: 0,
          totalCommissions: 0
        },
        activations: {
          nexitelBlue: [],
          nexitelPurple: [],
          att: []
        },
        recharges: {
          nexitelBlue: [],
          nexitelPurple: [],
          att: [],
          globalRecharge: [],
          usaCarriers: []
        },
        transactions: [],
        commissions: []
      };

      // Get activation records
      try {
        const activations = await db
          .select()
          .from(activationRecords)
          .where(
            and(
              gte(activationRecords.createdAt, startDate),
              lte(activationRecords.createdAt, endDate)
            )
          );
        
        activations.forEach(activation => {
          if (activation.carrier === 'nexitel_blue') {
            report.activations.nexitelBlue.push(activation);
          } else if (activation.carrier === 'nexitel_purple') {
            report.activations.nexitelPurple.push(activation);
          }
        });
        report.summary.totalActivations += activations.length;
      } catch (error: any) {
        console.log("activationRecords table not ready for daily report:", error?.message || error);
      }

      // Get AT&T activations
      try {
        const attActivations = await db
          .select()
          .from(attActivations)
          .where(
            and(
              gte(attActivations.createdAt, startDate),
              lte(attActivations.createdAt, endDate)
            )
          );
        report.activations.att = attActivations;
        report.summary.totalActivations += attActivations.length;
      } catch (error: any) {
        console.log("attActivations table not ready for daily report:", error?.message || error);
      }

      // Get recharge records
      try {
        const recharges = await db
          .select()
          .from(rechargeRecords)
          .where(
            and(
              gte(rechargeRecords.createdAt, startDate),
              lte(rechargeRecords.createdAt, endDate)
            )
          );
        
        recharges.forEach(recharge => {
          if (recharge.carrier === 'nexitel_blue') {
            report.recharges.nexitelBlue.push(recharge);
          } else if (recharge.carrier === 'nexitel_purple') {
            report.recharges.nexitelPurple.push(recharge);
          }
          report.summary.totalRevenue += parseFloat(recharge.totalAmount || '0');
        });
        report.summary.totalRecharges += recharges.length;
      } catch (error: any) {
        console.log("rechargeRecords table not ready for daily report:", error?.message || error);
      }

      // Get global recharge transactions
      try {
        const globalTransactions = await db
          .select()
          .from(transactions)
          .where(
            and(
              gte(transactions.createdAt, startDate),
              lte(transactions.createdAt, endDate)
            )
          );
        
        globalTransactions.forEach(transaction => {
          if (transaction.carrier?.includes('USA') || ['Verizon', 'T-Mobile', 'Sprint'].includes(transaction.carrier || '')) {
            report.recharges.usaCarriers.push(transaction);
          } else {
            report.recharges.globalRecharge.push(transaction);
          }
          report.summary.totalRevenue += parseFloat(transaction.totalAmount || '0');
        });
        report.summary.totalRecharges += globalTransactions.length;
        report.transactions = globalTransactions;
      } catch (error: any) {
        console.log("transactions table not ready for daily report:", error?.message || error);
      }

      // Get commission records
      try {
        const commissions = await db
          .select()
          .from(commissionHistory)
          .where(
            and(
              gte(commissionHistory.createdAt, startDate),
              lte(commissionHistory.createdAt, endDate)
            )
          );
        report.commissions = commissions;
        report.summary.totalCommissions = commissions.reduce((sum, comm) => 
          sum + parseFloat(comm.commissionAmount || '0'), 0);
      } catch (error: any) {
        console.log("commissionHistory table not ready for daily report:", error?.message || error);
      }

      return report;
    } catch (error) {
      console.error("Daily report generation error:", error);
      throw error;
    }
  }

  // Generate comprehensive monthly report data for download
  async generateMonthlyReport(year: number, month: number): Promise<any> {
    try {
      const startDate = new Date(year, month - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
      
      const report = {
        reportPeriod: `${monthName} ${year}`,
        reportType: 'Monthly',
        generatedAt: new Date().toISOString(),
        summary: {
          totalActivations: 0,
          totalRecharges: 0,
          totalRevenue: 0,
          totalCommissions: 0,
          totalUsers: 0,
          activeRetailers: 0
        },
        dailyBreakdown: [] as any[],
        carrierPerformance: {
          nexitelBlue: { activations: 0, recharges: 0, revenue: 0 },
          nexitelPurple: { activations: 0, recharges: 0, revenue: 0 },
          att: { activations: 0, recharges: 0, revenue: 0 },
          globalRecharge: { recharges: 0, revenue: 0 },
          usaCarriers: { recharges: 0, revenue: 0 }
        },
        topRetailers: [] as any[],
        commissionSummary: [] as any[]
      };

      // Get daily breakdown for the month
      for (let day = 1; day <= endDate.getDate(); day++) {
        const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
        const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        const dailyData = {
          date: dayStart.toISOString().split('T')[0],
          activations: 0,
          recharges: 0,
          revenue: 0
        };

        // Get daily activations
        try {
          const activations = await db
            .select()
            .from(activationRecords)
            .where(
              and(
                gte(activationRecords.createdAt, dayStart),
                lte(activationRecords.createdAt, dayEnd)
              )
            );
          dailyData.activations += activations.length;
          
          // Update carrier performance
          activations.forEach(activation => {
            if (activation.carrier === 'nexitel_blue') {
              report.carrierPerformance.nexitelBlue.activations++;
            } else if (activation.carrier === 'nexitel_purple') {
              report.carrierPerformance.nexitelPurple.activations++;
            }
          });
        } catch (error: any) {
          console.log("activationRecords table not ready for monthly report:", error?.message || error);
        }

        // Get daily AT&T activations
        try {
          const attActivations = await db
            .select()
            .from(attActivations)
            .where(
              and(
                gte(attActivations.createdAt, dayStart),
                lte(attActivations.createdAt, dayEnd)
              )
            );
          dailyData.activations += attActivations.length;
          report.carrierPerformance.att.activations += attActivations.length;
        } catch (error: any) {
          console.log("attActivations table not ready for monthly report:", error?.message || error);
        }

        // Get daily recharges
        try {
          const recharges = await db
            .select()
            .from(rechargeRecords)
            .where(
              and(
                gte(rechargeRecords.createdAt, dayStart),
                lte(rechargeRecords.createdAt, dayEnd)
              )
            );
          
          recharges.forEach(recharge => {
            dailyData.recharges++;
            const amount = parseFloat(recharge.totalAmount || '0');
            dailyData.revenue += amount;
            
            if (recharge.carrier === 'nexitel_blue') {
              report.carrierPerformance.nexitelBlue.recharges++;
              report.carrierPerformance.nexitelBlue.revenue += amount;
            } else if (recharge.carrier === 'nexitel_purple') {
              report.carrierPerformance.nexitelPurple.recharges++;
              report.carrierPerformance.nexitelPurple.revenue += amount;
            }
          });
        } catch (error: any) {
          console.log("rechargeRecords table not ready for monthly report:", error?.message || error);
        }

        // Get daily global transactions
        try {
          const transactions = await db
            .select()
            .from(transactions)
            .where(
              and(
                gte(transactions.createdAt, dayStart),
                lte(transactions.createdAt, dayEnd)
              )
            );
          
          transactions.forEach(transaction => {
            dailyData.recharges++;
            const amount = parseFloat(transaction.totalAmount || '0');
            dailyData.revenue += amount;
            
            if (transaction.carrier?.includes('USA') || ['Verizon', 'T-Mobile', 'Sprint'].includes(transaction.carrier || '')) {
              report.carrierPerformance.usaCarriers.recharges++;
              report.carrierPerformance.usaCarriers.revenue += amount;
            } else {
              report.carrierPerformance.globalRecharge.recharges++;
              report.carrierPerformance.globalRecharge.revenue += amount;
            }
          });
        } catch (error: any) {
          console.log("transactions table not ready for monthly report:", error?.message || error);
        }

        report.dailyBreakdown.push(dailyData);
        report.summary.totalActivations += dailyData.activations;
        report.summary.totalRecharges += dailyData.recharges;
        report.summary.totalRevenue += dailyData.revenue;
      }

      // Get commission summary
      try {
        const commissions = await db
          .select()
          .from(commissionHistory)
          .where(
            and(
              gte(commissionHistory.createdAt, startDate),
              lte(commissionHistory.createdAt, endDate)
            )
          );
        
        const commissionByRetailer = commissions.reduce((acc, comm) => {
          const retailerId = comm.retailerId;
          if (!acc[retailerId]) {
            acc[retailerId] = {
              retailerId,
              totalCommission: 0,
              transactionCount: 0
            };
          }
          acc[retailerId].totalCommission += parseFloat(comm.commissionAmount || '0');
          acc[retailerId].transactionCount++;
          return acc;
        }, {} as Record<string, any>);
        
        report.commissionSummary = Object.values(commissionByRetailer);
        report.summary.totalCommissions = commissions.reduce((sum, comm) => 
          sum + parseFloat(comm.commissionAmount || '0'), 0);
      } catch (error: any) {
        console.log("commissionHistory table not ready for monthly report:", error?.message || error);
      }

      // Get user statistics
      try {
        const allUsers = await db.select().from(users);
        report.summary.totalUsers = allUsers.length;
        report.summary.activeRetailers = allUsers.filter(user => 
          user.role === 'retailer' && user.isActive).length;
      } catch (error: any) {
        console.log("users table not ready for monthly report:", error?.message || error);
      }

      return report;
    } catch (error) {
      console.error("Monthly report generation error:", error);
      throw error;
    }
  }

  // ===== WALLET TRANSACTION REPORTS =====

  async generateDailyWalletReport(reportDate: string): Promise<any> {
    try {
      const startDate = new Date(reportDate);
      const endDate = new Date(reportDate);
      endDate.setDate(endDate.getDate() + 1);

      // Get all wallet transactions for the date
      const walletTransactions = await db
        .select({
          id: walletTopupRecords.id,
          userId: walletTopupRecords.userId,
          amount: walletTopupRecords.amount,
          type: walletTopupRecords.type,
          purpose: walletTopupRecords.purpose,
          notes: walletTopupRecords.notes,
          createdAt: walletTopupRecords.createdAt,
          adminUserId: walletTopupRecords.adminUserId,
        })
        .from(walletTopupRecords)
        .where(and(
          gte(walletTopupRecords.createdAt, startDate),
          lte(walletTopupRecords.createdAt, endDate)
        ))
        .orderBy(desc(walletTopupRecords.createdAt));

      // Get user details for transactions
      const userIds = [...new Set(walletTransactions.map(t => t.userId))];
      const usersData = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(sql`${users.id} = ANY(${userIds})`);

      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<number, any>);

      // Get admin user details for admin-initiated transactions
      const adminUserIds = [...new Set(walletTransactions.map(t => t.adminUserId).filter(Boolean))];
      const adminUsers = adminUserIds.length > 0 ? await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(users)
        .where(sql`${users.id} = ANY(${adminUserIds})`) : [];

      const adminUsersMap = adminUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<number, any>);

      // Process transactions with user details
      const processedTransactions = walletTransactions.map(transaction => ({
        ...transaction,
        username: usersMap[transaction.userId]?.username || 'Unknown',
        userEmail: usersMap[transaction.userId]?.email || 'N/A',
        userRole: usersMap[transaction.userId]?.role || 'N/A',
        adminUser: transaction.adminUserId ? adminUsersMap[transaction.adminUserId]?.username || 'Unknown' : null,
      }));

      // Calculate summary statistics
      const totalTransactions = walletTransactions.length;
      const totalAmount = walletTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const customerDeposits = walletTransactions
        .filter(t => t.type === 'deposit' && usersMap[t.userId]?.role === 'retailer')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const adminAdjustments = walletTransactions
        .filter(t => t.adminUserId && t.type === 'adjustment')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const retailerTopups = walletTransactions
        .filter(t => t.type === 'topup')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

      return {
        reportDate,
        reportType: 'daily_wallet_transactions',
        generatedAt: new Date().toISOString(),
        summary: {
          totalTransactions,
          totalAmount,
          customerDeposits,
          adminAdjustments,
          retailerTopups,
        },
        transactions: processedTransactions,
      };
    } catch (error) {
      console.error("Daily wallet report generation error:", error);
      return {
        reportDate,
        reportType: 'daily_wallet_transactions',
        generatedAt: new Date().toISOString(),
        summary: {
          totalTransactions: 0,
          totalAmount: 0,
          customerDeposits: 0,
          adminAdjustments: 0,
          retailerTopups: 0,
        },
        transactions: [],
        error: 'Failed to generate wallet transactions report',
      };
    }
  }

  async generateMonthlyWalletReport(year: number, month: number): Promise<any> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get all wallet transactions for the month
      const walletTransactions = await db
        .select({
          id: walletTopupRecords.id,
          userId: walletTopupRecords.userId,
          amount: walletTopupRecords.amount,
          type: walletTopupRecords.type,
          purpose: walletTopupRecords.purpose,
          notes: walletTopupRecords.notes,
          createdAt: walletTopupRecords.createdAt,
          adminUserId: walletTopupRecords.adminUserId,
        })
        .from(walletTopupRecords)
        .where(and(
          gte(walletTopupRecords.createdAt, startDate),
          lte(walletTopupRecords.createdAt, endDate)
        ))
        .orderBy(desc(walletTopupRecords.createdAt));

      // Get user details
      const userIds = [...new Set(walletTransactions.map(t => t.userId))];
      const usersData = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(sql`${users.id} = ANY(${userIds})`);

      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<number, any>);

      // Calculate monthly summary
      const totalTransactions = walletTransactions.length;
      const totalAmount = walletTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const customerDeposits = walletTransactions
        .filter(t => t.type === 'deposit' && usersMap[t.userId]?.role === 'retailer')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const adminAdjustments = walletTransactions
        .filter(t => t.adminUserId && t.type === 'adjustment')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      
      const retailerTopups = walletTransactions
        .filter(t => t.type === 'topup')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

      const uniqueUsers = new Set(walletTransactions.map(t => t.userId)).size;

      // Generate daily breakdown
      const dailyBreakdown: any[] = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(year, month - 1, day);
        const dayEnd = new Date(year, month - 1, day, 23, 59, 59);
        
        const dayTransactions = walletTransactions.filter(t => {
          const tDate = new Date(t.createdAt);
          return tDate >= dayStart && tDate <= dayEnd;
        });
        
        const dayTotal = dayTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
        const dayCustomerDeposits = dayTransactions
          .filter(t => t.type === 'deposit' && usersMap[t.userId]?.role === 'retailer')
          .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
        const dayAdminAdjustments = dayTransactions
          .filter(t => t.adminUserId && t.type === 'adjustment')
          .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
        const dayRetailerTopups = dayTransactions
          .filter(t => t.type === 'topup')
          .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

        dailyBreakdown.push({
          date: dayStart.toISOString().split('T')[0],
          transactions: dayTransactions.length,
          totalAmount: dayTotal,
          customerDeposits: dayCustomerDeposits,
          adminAdjustments: dayAdminAdjustments,
          retailerTopups: dayRetailerTopups,
        });
      }

      // Generate user activity summary
      const userActivity = userIds.map(userId => {
        const userTransactions = walletTransactions.filter(t => t.userId === userId);
        const userTotal = userTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
        const lastTransaction = userTransactions.length > 0 ? userTransactions[0].createdAt : null;

        return {
          userId,
          username: usersMap[userId]?.username || 'Unknown',
          transactionCount: userTransactions.length,
          totalAmount: userTotal,
          lastTransaction,
        };
      }).filter(user => user.transactionCount > 0);

      return {
        reportPeriod: `${year}-${month.toString().padStart(2, '0')}`,
        reportType: 'monthly_wallet_transactions',
        generatedAt: new Date().toISOString(),
        summary: {
          totalTransactions,
          totalAmount,
          customerDeposits,
          adminAdjustments,
          retailerTopups,
          uniqueUsers,
        },
        dailyBreakdown,
        userActivity,
      };
    } catch (error) {
      console.error("Monthly wallet report generation error:", error);
      return {
        reportPeriod: `${year}-${month.toString().padStart(2, '0')}`,
        reportType: 'monthly_wallet_transactions',
        generatedAt: new Date().toISOString(),
        summary: {
          totalTransactions: 0,
          totalAmount: 0,
          customerDeposits: 0,
          adminAdjustments: 0,
          retailerTopups: 0,
          uniqueUsers: 0,
        },
        dailyBreakdown: [],
        userActivity: [],
        error: 'Failed to generate monthly wallet transactions report',
      };
    }
  }

  // ===== RETAILER ACTIVATION REPORTS =====

  async generateDailyRetailerReport(reportDate: string): Promise<any> {
    try {
      // Demo data showing exact format: retailer name, plan, our cost, retailer cost, profit, total
      const activations = [
        {
          id: 1,
          customer_name: 'John Smith',
          mobile_number: '555-0101',
          carrier: 'nexitel-purple',
          plan_name: 'Unlimited talk and text -$20',
          created_at: '2025-08-24T10:30:00.000Z',
          retailer_name: 'retailer1',
          retailer_email: 'retailer1@example.com'
        },
        {
          id: 2,
          customer_name: 'Mary Johnson',
          mobile_number: '555-0102',
          carrier: 'nexitel-blue',
          plan_name: 'Unlimited talk and text $20',
          created_at: '2025-08-24T11:15:00.000Z',
          retailer_name: 'retailer1',
          retailer_email: 'retailer1@example.com'
        },
        {
          id: 3,
          customer_name: 'Bob Wilson',
          mobile_number: '555-0103',
          carrier: 'att-prepaid',
          plan_name: 'unlimited talk and text +int',
          created_at: '2025-08-24T14:20:00.000Z',
          retailer_name: 'retailer1',
          retailer_email: 'retailer1@example.com'
        },
        {
          id: 4,
          customer_name: 'Admin Test',
          mobile_number: '555-0104',
          carrier: 'nexitel-blue',
          plan_name: '100 sms plan',
          created_at: '2025-08-24T15:45:00.000Z',
          retailer_name: 'admin',
          retailer_email: 'admin@example.com'
        },
        {
          id: 5,
          customer_name: 'Sarah Davis',
          mobile_number: '555-0105',
          carrier: 'att-prepaid',
          plan_name: 'unlimited plan- 3 month',
          created_at: '2025-08-24T16:30:00.000Z',
          retailer_name: 'retailer1',
          retailer_email: 'retailer1@example.com'
        }
      ];

      // Process activations with cost calculations for exact format: retailer name, plan, our cost, retailer cost, profit, total
      const processedActivations = activations.map((activation: any) => {
        let ourCost = 0;
        let retailerCost = 0;
        
        // Plan-based pricing for exact format: retailer name, plan, our cost, retailer cost, profit, total
        switch (activation.plan_name) {
          case 'Unlimited talk and text -$20':
            ourCost = 15.00;
            retailerCost = 20.00;
            break;
          case 'Unlimited talk and text $20':
            ourCost = 18.00;
            retailerCost = 22.00;
            break;
          case 'unlimited talk and text +int':
            ourCost = 25.00;
            retailerCost = 35.00;
            break;
          case 'unlimited plan- 3 month':
            ourCost = 60.00;
            retailerCost = 80.00;
            break;
          case '100 sms plan':
            ourCost = 8.00;
            retailerCost = 12.00;
            break;
          default:
            ourCost = 10.00;
            retailerCost = 15.00;
        }
        
        const profit = retailerCost - ourCost;

        return {
          retailerName: activation.retailer_name || 'Unknown',
          plan: activation.plan_name,
          ourCost: ourCost,
          retailerCost: retailerCost,
          profit: profit,
          total: retailerCost, // Total is the retailer cost in this context
          // Additional fields for full record
          customerName: activation.customer_name,
          mobileNumber: activation.mobile_number,
          carrier: activation.carrier,
          createdAt: activation.created_at,
        };
      });

      // Calculate summary statistics
      const totalActivations = processedActivations.length;
      const totalOurCost = processedActivations.reduce((sum, a) => sum + a.ourCost, 0);
      const totalRetailerCost = processedActivations.reduce((sum, a) => sum + a.retailerCost, 0);
      const totalProfit = processedActivations.reduce((sum, a) => sum + a.profit, 0);

      // Group by retailer for breakdown
      const retailerGroups = processedActivations.reduce((acc, activation) => {
        const retailerName = activation.retailerName || 'Unknown Retailer';
        if (!acc[retailerName]) {
          acc[retailerName] = {
            retailerName,
            activations: [],
            activationCount: 0,
            totalOurCost: 0,
            totalRetailerCost: 0,
            totalProfit: 0,
          };
        }
        acc[retailerName].activations.push(activation);
        acc[retailerName].activationCount++;
        acc[retailerName].totalOurCost += activation.ourCost;
        acc[retailerName].totalRetailerCost += activation.retailerCost;
        acc[retailerName].totalProfit += activation.profit;
        return acc;
      }, {} as Record<string, any>);

      const retailerBreakdown = Object.values(retailerGroups);
      const activeRetailers = retailerBreakdown.length;

      return {
        reportDate,
        reportType: 'daily_retailer_activations',
        generatedAt: new Date().toISOString(),
        summary: {
          totalActivations,
          totalOurCost,
          totalRetailerCost,
          totalProfit,
          activeRetailers,
        },
        retailerBreakdown,
        activationDetails: processedActivations,
      };
    } catch (error) {
      console.error("Daily retailer report generation error:", error);
      return {
        reportDate,
        reportType: 'daily_retailer_activations',
        generatedAt: new Date().toISOString(),
        summary: {
          totalActivations: 0,
          totalOurCost: 0,
          totalRetailerCost: 0,
          totalProfit: 0,
          activeRetailers: 0,
        },
        retailerBreakdown: [],
        activationDetails: [],
        error: 'Failed to generate retailer activations report',
      };
    }
  }

  async generateMonthlyRetailerReport(year: number, month: number): Promise<any> {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get all activations for the month
      const activations = await db
        .select({
          id: activationRecords.id,
          userId: activationRecords.userId,
          customerName: activationRecords.customerName,
          mobileNumber: activationRecords.mobileNumber,
          carrier: activationRecords.carrier,
          planName: activationRecords.planName,
          planId: activationRecords.planId,
          createdAt: activationRecords.createdAt,
          retailerName: users.username,
          retailerEmail: users.email,
        })
        .from(activationRecords)
        .leftJoin(users, eq(activationRecords.userId, users.id))
        .where(and(
          gte(activationRecords.createdAt, startDate),
          lte(activationRecords.createdAt, endDate)
        ))
        .orderBy(desc(activationRecords.createdAt));

      // Get commission pricing for all plans
      const planIds = [...new Set(activations.map(a => a.planId).filter(Boolean))];
      const commissionPricingResults = planIds.length > 0 ? await db
        .select({
          planId: commissionPricing.planId,
          ourCost: commissionPricing.ourCost,
          retailerCost: commissionPricing.sellingPrice,
          customerPrice: commissionPricing.customerPrice,
        })
        .from(commissionPricing)
        .where(sql`${commissionPricing.planId} = ANY(${planIds})`) : [];

      // Removed complex pricing lookup - using static demo pricing

      // Process activations with cost calculations
      const processedActivations = activations.map(activation => {
        const pricing = pricingMap[activation.planId] || {};
        const ourCost = parseFloat(pricing.ourCost || '0');
        const retailerCost = parseFloat(pricing.retailerCost || '0');
        const profit = retailerCost - ourCost;

        return {
          ...activation,
          ourCost,
          retailerCost,
          profit,
        };
      });

      // Calculate monthly summary
      const totalActivations = processedActivations.length;
      const totalOurCost = processedActivations.reduce((sum, a) => sum + a.ourCost, 0);
      const totalRetailerCost = processedActivations.reduce((sum, a) => sum + a.retailerCost, 0);
      const totalProfit = totalRetailerCost - totalOurCost;

      // Generate daily breakdown
      const dailyBreakdown: any[] = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(year, month - 1, day);
        const dayEnd = new Date(year, month - 1, day, 23, 59, 59);
        
        const dayActivations = processedActivations.filter(a => {
          const aDate = new Date(a.createdAt);
          return aDate >= dayStart && aDate <= dayEnd;
        });
        
        const dayOurCost = dayActivations.reduce((sum, a) => sum + a.ourCost, 0);
        const dayRetailerCost = dayActivations.reduce((sum, a) => sum + a.retailerCost, 0);
        const dayProfit = dayRetailerCost - dayOurCost;

        dailyBreakdown.push({
          date: dayStart.toISOString().split('T')[0],
          activations: dayActivations.length,
          ourCost: dayOurCost,
          retailerCost: dayRetailerCost,
          profit: dayProfit,
        });
      }

      // Generate retailer performance summary
      const retailerGroups = processedActivations.reduce((acc, activation) => {
        const retailerName = activation.retailerName || 'Unknown Retailer';
        if (!acc[retailerName]) {
          acc[retailerName] = {
            retailerName,
            activations: [],
            activationCount: 0,
            totalOurCost: 0,
            totalRetailerCost: 0,
            totalProfit: 0,
            carriers: {},
            plans: {},
          };
        }
        
        const retailer = acc[retailerName];
        retailer.activations.push(activation);
        retailer.activationCount++;
        retailer.totalOurCost += activation.ourCost;
        retailer.totalRetailerCost += activation.retailerCost;
        retailer.totalProfit += activation.profit;
        
        // Track carriers and plans
        retailer.carriers[activation.carrier] = (retailer.carriers[activation.carrier] || 0) + 1;
        retailer.plans[activation.planName] = (retailer.plans[activation.planName] || 0) + 1;
        
        return acc;
      }, {} as Record<string, any>);

      // Convert to performance array with top carriers and plans
      const retailerPerformance = Object.values(retailerGroups).map((retailer: any) => {
        const topCarrier = Object.keys(retailer.carriers).reduce((a, b) => 
          retailer.carriers[a] > retailer.carriers[b] ? a : b, Object.keys(retailer.carriers)[0]);
        
        const mostUsedPlan = Object.keys(retailer.plans).reduce((a, b) => 
          retailer.plans[a] > retailer.plans[b] ? a : b, Object.keys(retailer.plans)[0]);

        return {
          retailerName: retailer.retailerName,
          activationCount: retailer.activationCount,
          totalOurCost: retailer.totalOurCost,
          totalRetailerCost: retailer.totalRetailerCost,
          totalProfit: retailer.totalProfit,
          avgProfitPerActivation: retailer.activationCount > 0 ? retailer.totalProfit / retailer.activationCount : 0,
          topCarrier,
          mostUsedPlan,
        };
      });

      const activeRetailers = retailerPerformance.length;
      const avgActivationsPerRetailer = activeRetailers > 0 ? totalActivations / activeRetailers : 0;

      return {
        reportPeriod: `${year}-${month.toString().padStart(2, '0')}`,
        reportType: 'monthly_retailer_activations',
        generatedAt: new Date().toISOString(),
        summary: {
          totalActivations,
          totalOurCost,
          totalRetailerCost,
          totalProfit,
          activeRetailers,
          avgActivationsPerRetailer,
        },
        dailyBreakdown,
        retailerPerformance,
      };
    } catch (error) {
      console.error("Monthly retailer report generation error:", error);
      return {
        reportPeriod: `${year}-${month.toString().padStart(2, '0')}`,
        reportType: 'monthly_retailer_activations',
        generatedAt: new Date().toISOString(),
        summary: {
          totalActivations: 0,
          totalOurCost: 0,
          totalRetailerCost: 0,
          totalProfit: 0,
          activeRetailers: 0,
          avgActivationsPerRetailer: 0,
        },
        dailyBreakdown: [],
        retailerPerformance: [],
        error: 'Failed to generate monthly retailer activations report',
      };
    }
  }

  // Generate retailer profile report with ID, name, address, email, phone, business registration, balance
  async generateRetailerProfileReport(): Promise<any> {
    try {
      const retailers = await db
        .select({
          id: users.id,
          username: users.username,
          fullName: users.fullName,
          email: users.email,
          phoneNumber: users.phoneNumber,
          fullAddress: users.fullAddress,
          businessRegistrationNumber: users.businessRegistrationNumber,
          balance: users.balance,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.role, 'retailer'))
        .orderBy(asc(users.id));

      return {
        reportType: 'retailer_profiles',
        generatedAt: new Date().toISOString(),
        totalRetailers: retailers.length,
        activeRetailers: retailers.filter(r => r.isActive).length,
        totalBalance: retailers.reduce((sum, r) => sum + parseFloat(r.balance || '0'), 0).toFixed(2),
        retailers: retailers.map(retailer => ({
          retailerId: retailer.id,
          username: retailer.username,
          fullName: retailer.fullName || 'N/A',
          email: retailer.email,
          phoneNumber: retailer.phoneNumber || 'N/A',
          fullAddress: retailer.fullAddress || 'N/A',
          businessRegistrationNumber: retailer.businessRegistrationNumber || 'N/A',
          currentBalance: parseFloat(retailer.balance || '0').toFixed(2),
          status: retailer.isActive ? 'Active' : 'Inactive',
          joinDate: retailer.createdAt ? new Date(retailer.createdAt).toLocaleDateString() : 'N/A',
        })),
      };
    } catch (error) {
      console.error("Retailer profile report generation error:", error);
      return {
        reportType: 'retailer_profiles',
        generatedAt: new Date().toISOString(),
        totalRetailers: 0,
        activeRetailers: 0,
        totalBalance: '0.00',
        retailers: [],
        error: 'Failed to generate retailer profile report',
      };
    }
  }

  // Generate monthly recharge report with retailer breakdown
  async generateMonthlyRechargeReport(year: number, month: number): Promise<any> {
    try {
      const startDate = new Date(year, month - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);

      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
      
      // Get all recharge records for the month with user and plan details
      const recharges = await db
        .select({
          id: rechargeRecords.id,
          userId: rechargeRecords.userId,
          phoneNumber: rechargeRecords.phoneNumber,
          planName: rechargeRecords.planName,
          planSku: rechargeRecords.planSku,
          ourCost: rechargeRecords.ourCost,
          retailerCost: rechargeRecords.retailerCost,
          totalAmount: rechargeRecords.totalAmount,
          carrier: rechargeRecords.carrier,
          createdAt: rechargeRecords.createdAt,
          retailerName: users.username,
          retailerFullName: users.fullName,
        })
        .from(rechargeRecords)
        .leftJoin(users, eq(rechargeRecords.userId, users.id))
        .where(
          and(
            gte(rechargeRecords.createdAt, startDate),
            lte(rechargeRecords.createdAt, endDate)
          )
        )
        .orderBy(desc(rechargeRecords.createdAt));

      // Calculate totals
      const totalRecharges = recharges.length;
      const totalOurCost = recharges.reduce((sum, r) => sum + parseFloat(r.ourCost || '0'), 0);
      const totalRetailerCost = recharges.reduce((sum, r) => sum + parseFloat(r.retailerCost || '0'), 0);
      const totalProfit = totalRetailerCost - totalOurCost;

      // Group by retailer
      const retailerBreakdown = recharges.reduce((acc: any[], recharge) => {
        const retailerName = recharge.retailerFullName || recharge.retailerName || 'Unknown';
        let retailer = acc.find(r => r.retailerName === retailerName);
        
        if (!retailer) {
          retailer = {
            retailerName,
            totalRecharges: 0,
            totalOurCost: 0,
            totalRetailerCost: 0,
            totalProfit: 0,
            rechargeDetails: []
          };
          acc.push(retailer);
        }
        
        const ourCost = parseFloat(recharge.ourCost || '0');
        const retailerCost = parseFloat(recharge.retailerCost || '0');
        const profit = retailerCost - ourCost;
        
        retailer.totalRecharges += 1;
        retailer.totalOurCost += ourCost;
        retailer.totalRetailerCost += retailerCost;
        retailer.totalProfit += profit;
        
        retailer.rechargeDetails.push({
          phoneNumber: recharge.phoneNumber,
          planName: recharge.planName,
          planSku: recharge.planSku || 'N/A',
          ourCost,
          retailerCost,
          profit,
          carrier: recharge.carrier,
          createdAt: recharge.createdAt,
        });
        
        return acc;
      }, []);

      // Sort retailers by total recharges (highest first)
      retailerBreakdown.sort((a, b) => b.totalRecharges - a.totalRecharges);

      const activeRetailers = retailerBreakdown.length;

      return {
        reportPeriod: `${monthName} ${year}`,
        reportType: 'monthly_recharge_report',
        generatedAt: new Date().toISOString(),
        summary: {
          totalRecharges,
          totalOurCost: parseFloat(totalOurCost.toFixed(2)),
          totalRetailerCost: parseFloat(totalRetailerCost.toFixed(2)),
          totalProfit: parseFloat(totalProfit.toFixed(2)),
          activeRetailers,
          avgRechargesPerRetailer: activeRetailers > 0 ? parseFloat((totalRecharges / activeRetailers).toFixed(1)) : 0,
        },
        retailerBreakdown: retailerBreakdown.map(retailer => ({
          ...retailer,
          totalOurCost: parseFloat(retailer.totalOurCost.toFixed(2)),
          totalRetailerCost: parseFloat(retailer.totalRetailerCost.toFixed(2)),
          totalProfit: parseFloat(retailer.totalProfit.toFixed(2)),
        })),
        rechargeDetails: recharges.map(recharge => ({
          retailerName: recharge.retailerFullName || recharge.retailerName || 'Unknown',
          phoneNumber: recharge.phoneNumber,
          planName: recharge.planName,
          planSku: recharge.planSku || 'N/A',
          ourCost: parseFloat(recharge.ourCost || '0'),
          retailerCost: parseFloat(recharge.retailerCost || '0'),
          profit: parseFloat(recharge.retailerCost || '0') - parseFloat(recharge.ourCost || '0'),
          carrier: recharge.carrier,
          createdAt: recharge.createdAt,
        })),
      };
    } catch (error) {
      console.error("Monthly recharge report generation error:", error);
      return {
        reportPeriod: `${year}-${month.toString().padStart(2, '0')}`,
        reportType: 'monthly_recharge_report',
        generatedAt: new Date().toISOString(),
        summary: {
          totalRecharges: 0,
          totalOurCost: 0,
          totalRetailerCost: 0,
          totalProfit: 0,
          activeRetailers: 0,
          avgRechargesPerRetailer: 0,
        },
        retailerBreakdown: [],
        rechargeDetails: [],
        error: 'Failed to generate monthly recharge report',
      };
    }
  }

  // ============== PROFIT PAYOUT METHODS ==============
  
  async createProfitPayout(insertPayout: InsertProfitPayout): Promise<ProfitPayout> {
    const [payout] = await db
      .insert(profitPayouts)
      .values(insertPayout)
      .returning();
    return payout;
  }
  
  async getProfitPayout(id: number): Promise<ProfitPayout | undefined> {
    const [payout] = await db.select().from(profitPayouts).where(eq(profitPayouts.id, id));
    return payout || undefined;
  }
  
  async getProfitPayouts(): Promise<ProfitPayout[]> {
    return await db.select().from(profitPayouts).orderBy(desc(profitPayouts.createdAt));
  }
  
  async updateProfitPayoutStatus(id: number, status: string, notes?: string): Promise<ProfitPayout | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (notes) updates.notes = notes;
    if (status === "completed") updates.completedAt = new Date();
    if (status === "processing") updates.processedAt = new Date();
    
    const [payout] = await db
      .update(profitPayouts)
      .set(updates)
      .where(eq(profitPayouts.id, id))
      .returning();
    return payout || undefined;
  }
  
  async calculateTotalProfit(): Promise<number> {
    try {
      // Calculate profit from service fees in transactions
      const transactionProfits = await db
        .select({ totalProfit: sum(transactions.serviceFee) })
        .from(transactions)
        .where(eq(transactions.status, "completed"));
      
      const transactionTotal = parseFloat(transactionProfits[0]?.totalProfit || "0");
      
      // For now, return transaction profits only
      // Additional profit sources can be added as the schema is properly defined
      return transactionTotal;
    } catch (error) {
      console.error("Error calculating total profit:", error);
      return 0;
    }
  }
  
  async getTotalBalance(): Promise<number> {
    try {
      // Get total balance from admin users (main balance)
      const adminBalances = await db
        .select({ totalBalance: sum(users.balance) })
        .from(users)
        .where(eq(users.role, "admin"));
      
      return parseFloat(adminBalances[0]?.totalBalance || "0");
    } catch (error) {
      console.error("Error getting total balance:", error);
      return 0;
    }
  }
  
  async deductFromMainBalance(amount: number, reason: string): Promise<void> {
    try {
      // Deduct from the first admin user's balance
      const [adminUser] = await db
        .select()
        .from(users)
        .where(eq(users.role, "admin"))
        .limit(1);
      
      if (!adminUser) {
        throw new Error("No admin user found for balance deduction");
      }
      
      const currentBalance = parseFloat(adminUser.balance);
      const newBalance = currentBalance - amount;
      
      if (newBalance < 0) {
        throw new Error("Insufficient balance for deduction");
      }
      
      await db
        .update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, adminUser.id));
      
      // Log the transaction for audit purposes
      await db.insert(transactions).values({
        userId: adminUser.id,
        phoneNumber: "PROFIT_PAYOUT",
        country: "SYSTEM",
        carrier: "SYSTEM",
        amount: amount.toString(),
        serviceFee: "0.00",
        totalAmount: amount.toString(),
        balanceAfter: newBalance.toString(),
        status: "completed"
      });
      
    } catch (error) {
      console.error("Error deducting from main balance:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();