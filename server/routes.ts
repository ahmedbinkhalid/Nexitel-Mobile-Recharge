import express, { type Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertTransactionSchema,
  insertSavedNumberSchema,
  planManagementSchema,
  commissionGroupSchema,
  commissionPricingSchema,
  rechargeSchema,
  activitySearchSchema,
  reportGenerationSchema,
  insertActivationRecordSchema,
  insertRechargeRecordSchema,
  insertCommissionHistorySchema,
  insertWalletTopupRecordSchema,
  insertProfitPayoutSchema,
  // AT&T Schemas
  insertAttActivationSchema,
  insertAttDataAddonSchema,
  insertAttSimSwapSchema,
  insertAttRechargeSchema,
  insertAttBulkActivationSchema,
  insertRetailerAttPermissionSchema,
  type User 
} from "@shared/schema";

// Session type extension
declare module "express-session" {
  interface SessionData {
    user?: Omit<User, "password">;
  }
}

export function registerRoutes(app: express.Application) {
  // Helper function to validate request body
  function validateBody<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: Function) => {
      try {
        console.log("Validating request body:", req.body);
        req.body = schema.parse(req.body);
        console.log("Validation successful");
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.log("Validation error:", error.errors);
          return res.status(400).json({ 
            message: "Validation error", 
            errors: error.errors 
          });
        }
        console.log("Other validation error:", error);
        return res.status(400).json({ message: "Invalid request body" });
      }
    };
  }

  // Authentication middleware
  function requireAuth(req: Request, res: Response, next: Function) {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }

  // Role-based authorization middleware
  function requireRole(roles: string[]) {
    return (req: Request, res: Response, next: Function) => {
      if (!req.session?.user || !roles.includes(req.session.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
  }

  // ===== AUTHENTICATION ROUTES =====

  // Employee ID verification endpoint
  app.post("/api/auth/verify-employee-id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.body;
      const currentUser = req.session?.user;

      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Only employees need to verify their ID
      if (currentUser.role !== "employee") {
        return res.status(403).json({ message: "Employee verification not required for your role" });
      }

      // Get the full user record to check employee ID
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify employee ID matches
      if (!user.employeeId) {
        return res.status(400).json({ message: "Employee ID not set for this user. Please contact admin." });
      }

      if (user.employeeId !== employeeId) {
        return res.status(400).json({ message: "Invalid Employee ID. Please check and try again." });
      }

      res.json({ message: "Employee ID verified successfully" });
    } catch (error) {
      console.error("Employee ID verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check current session with enhanced debugging
  app.get("/api/auth/me", (req: Request, res: Response) => {
    console.log('Session check:', {
      sessionId: req.session?.id,
      hasUser: !!req.session?.user,
      userId: req.session?.user?.id,
      cookies: req.headers.cookie,
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    });
    
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.session.user });
  });

  // Login
  app.post("/api/auth/login", validateBody(loginSchema), async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt for username:", username);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log("User not found:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      
      // Initialize session if not exists
      if (!req.session) {
        return res.status(500).json({ message: "Session not initialized" });
      }
      
      // Set user in session and force save
      req.session.user = userWithoutPassword;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Log session
      await storage.createAuditLog({
        userId: user.id,
        entityType: "session",
        entityId: req.session.id || "unknown",
        action: "login",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });



  // Logout
  app.post("/api/auth/logout", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session?.user) {
        await storage.createAuditLog({
          userId: req.session.user.id,
          entityType: "session",
          entityId: req.session.id || "unknown",
          action: "logout",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        });
      }

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== USER MANAGEMENT ROUTES =====

  // Get all users (admin only)
  app.get("/api/users", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get employees only (admin only)
  app.get("/api/users/employee", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const employees = await storage.getUsersByRole("employee");
      const employeesWithoutPasswords = employees.map(({ password, ...user }) => user);
      res.json(employeesWithoutPasswords);
    } catch (error) {
      console.error("Get employees error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get retailers only (admin only)
  app.get("/api/users/role/retailer", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const retailers = await storage.getUsersByRole("retailer");
      const retailersWithoutPasswords = retailers.map(({ password, ...user }) => user);
      res.json(retailersWithoutPasswords);
    } catch (error) {
      console.error("Get retailers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create user (admin only)
  app.post("/api/users", requireAuth, requireRole(["admin"]), validateBody(insertUserSchema), async (req: Request, res: Response) => {
    try {
      console.log("Creating user with data:", req.body);
      
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log("Username already exists:", req.body.username);
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        console.log("Email already exists:", req.body.email);
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(req.body);
      const { password, ...userWithoutPassword } = user;
      console.log("User created successfully:", userWithoutPassword);

      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "user",
        entityId: user.id.toString(),
        action: "create",
        newValues: userWithoutPassword,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user (admin only)
  app.patch("/api/users/:id", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      console.log("Updating user with ID:", userId, "Data:", req.body);
      
      // Validate the incoming data against the user schema (excluding fund fields)
      const updateUserSchema = insertUserSchema.partial().omit({
        canAddFunds: true,
        maxDailyFunding: true,
        maxMonthlyFunding: true,
      });
      
      const validatedData = updateUserSchema.parse(req.body);
      
      const user = await storage.updateUser(userId, validatedData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      console.log("User updated successfully:", userWithoutPassword);

      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "user",
        entityId: userId.toString(),
        action: "update",
        newValues: userWithoutPassword,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== TRANSACTION ROUTES =====

  // Get all transactions (admin/employee) or user's transactions
  app.get("/api/transactions", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      let transactions;

      if (user.role === "admin" || user.role === "employee") {
        transactions = await storage.getAllTransactions();
      } else {
        transactions = await storage.getTransactionsByUser(user.id);
      }

      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create transaction (process recharge)
  app.post("/api/transactions", requireAuth, validateBody(rechargeSchema), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const { phoneNumber, country, carrier, amount } = req.body;

      // Calculate fees (this would normally come from plan management)
      const serviceFee = (amount * 0.05).toFixed(2); // 5% service fee
      const totalAmount = (amount + parseFloat(serviceFee)).toFixed(2);

      const result = await storage.processRechargeTransaction({
        userId: user.id,
        phoneNumber,
        country,
        carrier,
        amount: amount.toString(),
        serviceFee,
        totalAmount,
        status: "completed",
      });

      await storage.createAuditLog({
        userId: user.id,
        entityType: "transaction",
        entityId: result.transaction.id.toString(),
        action: "create",
        newValues: result.transaction,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ message: (error as Error).message || "Internal server error" });
    }
  });

  // ===== PLAN MANAGEMENT ROUTES =====

  // Get all plans (admin/employee) or retailer-specific plans
  app.get("/api/plans", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const { serviceType } = req.query;
      let plans;

      if (user.role === "retailer") {
        // For all service types, use commission pricing if available, otherwise fall back to base pricing
        if (serviceType && typeof serviceType === "string") {
          // Try to get retailer-specific pricing first
          const commissionPlans = await storage.getRetailerPlansByServiceType(user.id, serviceType);
          if (commissionPlans.length > 0) {
            plans = commissionPlans;
          } else {
            // Fall back to base pricing for recharge plans if no commission pricing exists
            if (serviceType.includes("_recharge") || serviceType === "nexitel_recharge" || serviceType === "att_recharge") {
              plans = await storage.getPlansByServiceType(serviceType);
            } else {
              plans = [];
            }
          }
        } else {
          // Get all retailer plans (commission-based and recharge fallbacks)
          const commissionPlans = await storage.getRetailerPlans(user.id);
          const allPlans = await storage.getAllPlans();
          const rechargePlans = allPlans.filter(plan => 
            plan.serviceType.includes("_recharge") && 
            !commissionPlans.some(cp => cp.id === plan.id)
          );
          plans = [...commissionPlans, ...rechargePlans];
        }
      } else {
        // For admin/employee, show commission pricing for activation services, base pricing for management
        if (serviceType && typeof serviceType === "string") {
          // For activation services (nexitel, att), show commission pricing from default commission group 3
          if (serviceType === "nexitel" || serviceType === "att") {
            // Try to get commission pricing from commission group 3 first
            const demoCommissionPlans = await storage.getCommissionPlansByServiceType(3, serviceType);
            if (demoCommissionPlans.length > 0) {
              plans = demoCommissionPlans;
            } else {
              plans = await storage.getPlansByServiceType(serviceType);
            }
          } else {
            // For other services, show base pricing
            plans = await storage.getPlansByServiceType(serviceType);
          }
        } else {
          plans = await storage.getAllPlans();
        }
      }

      res.json(plans);
    } catch (error) {
      console.error("Get plans error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create plan (admin only)
  app.post("/api/plans", requireAuth, requireRole(["admin"]), validateBody(planManagementSchema), async (req: Request, res: Response) => {
    try {
      // Since retailer pricing is handled in commission management,
      // we set default values for backward compatibility
      const denomination = typeof req.body.denomination === 'string' ? req.body.denomination : String(req.body.denomination);
      const ourCost = typeof req.body.ourCost === 'string' ? req.body.ourCost : String(req.body.ourCost);
      
      const planData = {
        ...req.body,
        denomination,
        retailerPrice: denomination, // For recharge plans, customer pays the denomination amount
        ourCost,
        profit: (parseFloat(denomination) - parseFloat(ourCost)).toString(), // Calculate basic profit
      };

      const plan = await storage.createPlan(planData);

      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "plan",
        entityId: plan.id.toString(),
        action: "create",
        newValues: plan,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json(plan);
    } catch (error) {
      console.error("Create plan error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update plan (admin only)
  app.patch("/api/plans/:id", requireAuth, requireRole(["admin"]), validateBody(planManagementSchema), async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      console.log("Updating plan with ID:", planId, "Data:", req.body);
      
      const planData = {
        ...req.body,
        retailerPrice: "0", // Will be overridden by commission pricing
        ourCost: req.body.ourCost.toString(),
        profit: "0", // Will be calculated in commission pricing
      };

      const plan = await storage.updatePlan(planId, planData);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "plan",
        entityId: planId.toString(),
        action: "update",
        newValues: plan,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(plan);
    } catch (error) {
      console.error("Update plan error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete plan (admin only)
  app.delete("/api/plans/:id", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      console.log("Deleting plan with ID:", planId);
      
      const success = await storage.deletePlan(planId);
      if (!success) {
        return res.status(404).json({ message: "Plan not found" });
      }

      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "plan",
        entityId: planId.toString(),
        action: "delete",
        newValues: {},
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      console.error("Delete plan error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== FUND MANAGEMENT ROUTES =====

  // Transfer funds (admin only)
  app.post("/api/fund-transfers", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const { toUserId, amount, description } = req.body;
      const fromUserId = req.session.user!.id;

      const success = await storage.transferFunds(fromUserId, toUserId, amount, description);
      
      if (!success) {
        return res.status(400).json({ message: "Transfer failed - insufficient funds or invalid user" });
      }

      await storage.createAuditLog({
        userId: fromUserId,
        entityType: "fund_transfer",
        entityId: `${fromUserId}-${toUserId}`,
        action: "create",
        newValues: { fromUserId, toUserId, amount, description },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({ message: "Funds transferred successfully" });
    } catch (error) {
      console.error("Fund transfer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== SAVED NUMBERS ROUTES =====

  // Get user's saved numbers
  app.get("/api/saved-numbers", requireAuth, async (req: Request, res: Response) => {
    try {
      const savedNumbers = await storage.getSavedNumbersByUser(req.session.user!.id);
      res.json(savedNumbers);
    } catch (error) {
      console.error("Get saved numbers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save a number
  app.post("/api/saved-numbers", requireAuth, validateBody(insertSavedNumberSchema), async (req: Request, res: Response) => {
    try {
      const savedNumberData = {
        ...req.body,
        userId: req.session.user!.id,
      };

      const savedNumber = await storage.createSavedNumber(savedNumberData);
      res.status(201).json(savedNumber);
    } catch (error) {
      console.error("Save number error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== PLAN PERFORMANCE ROUTES =====

  // Get plan performance metrics with sparkline data
  app.get("/api/plans/:id/performance", requireAuth, async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      const days = parseInt(req.query.days as string) || 30;
      
      const metrics = await storage.getPlanPerformanceMetrics(planId, days);
      
      // If no metrics exist, generate sample data
      if (metrics.length === 0) {
        await storage.updatePlanPerformanceMetrics(planId);
        const newMetrics = await storage.getPlanPerformanceMetrics(planId, days);
        return res.json(newMetrics);
      }
      
      res.json(metrics);
    } catch (error) {
      console.error("Get plan performance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update plan performance metrics
  app.post("/api/plans/:id/performance/update", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      await storage.updatePlanPerformanceMetrics(planId);
      res.json({ message: "Performance metrics updated successfully" });
    } catch (error) {
      console.error("Update plan performance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ===== ANALYTICS ROUTES =====

  // Analytics overview for admin dashboard
  app.get("/api/analytics/overview", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const analytics = await storage.getAnalyticsOverview();
      res.json(analytics);
    } catch (error) {
      console.error("Get analytics overview error:", error);
      res.status(500).json({ message: "Failed to fetch analytics overview" });
    }
  });

  // Daily activation analytics by carrier
  app.get("/api/analytics/daily-activations", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const activations = await storage.getDailyActivationsByCarrier(days);
      res.json(activations);
    } catch (error) {
      console.error("Get daily activations analytics error:", error);
      res.status(500).json({ message: "Failed to fetch daily activations analytics" });
    }
  });

  // Daily recharge analytics by carrier
  app.get("/api/analytics/daily-recharges", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const recharges = await storage.getDailyRechargesByCarrier(days);
      res.json(recharges);
    } catch (error) {
      console.error("Get daily recharges analytics error:", error);
      res.status(500).json({ message: "Failed to fetch daily recharges analytics" });
    }
  });

  // ===== DOWNLOADABLE REPORTS =====

  // Download daily report
  app.get("/api/reports/daily/:date", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportDate = req.params.date;
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }

      const reportData = await storage.generateDailyReport(reportDate);
      
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="daily-report-${reportDate}.json"`);
      
      res.json(reportData);
    } catch (error) {
      console.error("Daily report generation error:", error);
      res.status(500).json({ message: "Failed to generate daily report" });
    }
  });

  // Download monthly report
  app.get("/api/reports/monthly/:year/:month", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const reportData = await storage.generateMonthlyReport(year, month);
      
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${year}-${month.toString().padStart(2, '0')}.json"`);
      
      res.json(reportData);
    } catch (error) {
      console.error("Monthly report generation error:", error);
      res.status(500).json({ message: "Failed to generate monthly report" });
    }
  });

  // Download daily report as CSV
  app.get("/api/reports/daily/:date/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportDate = req.params.date;
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }

      const reportData = await storage.generateDailyReport(reportDate);
      
      // Generate CSV content
      let csvContent = `Daily Report - ${reportDate}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary section
      csvContent += `SUMMARY\n`;
      csvContent += `Total Activations,${reportData.summary.totalActivations}\n`;
      csvContent += `Total Recharges,${reportData.summary.totalRecharges}\n`;
      csvContent += `Total Revenue,$${reportData.summary.totalRevenue.toFixed(2)}\n`;
      csvContent += `Total Commissions,$${reportData.summary.totalCommissions.toFixed(2)}\n\n`;
      
      // Activations by carrier
      csvContent += `ACTIVATIONS BY CARRIER\n`;
      csvContent += `Carrier,Count\n`;
      csvContent += `Nexitel Blue,${reportData.activations.nexitelBlue.length}\n`;
      csvContent += `Nexitel Purple,${reportData.activations.nexitelPurple.length}\n`;
      csvContent += `AT&T,${reportData.activations.att.length}\n\n`;
      
      // Recharges by carrier
      csvContent += `RECHARGES BY CARRIER\n`;
      csvContent += `Carrier,Count\n`;
      csvContent += `Nexitel Blue,${reportData.recharges.nexitelBlue.length}\n`;
      csvContent += `Nexitel Purple,${reportData.recharges.nexitelPurple.length}\n`;
      csvContent += `AT&T,${reportData.recharges.att.length}\n`;
      csvContent += `Global Recharge,${reportData.recharges.globalRecharge.length}\n`;
      csvContent += `USA Carriers,${reportData.recharges.usaCarriers.length}\n\n`;
      
      // Transactions detail
      if (reportData.transactions.length > 0) {
        csvContent += `TRANSACTION DETAILS\n`;
        csvContent += `Time,Phone Number,Carrier,Amount,Status\n`;
        reportData.transactions.forEach((transaction: any) => {
          csvContent += `${new Date(transaction.createdAt).toLocaleString()},${transaction.phoneNumber || 'N/A'},${transaction.carrier || 'N/A'},$${transaction.totalAmount || '0.00'},${transaction.status || 'N/A'}\n`;
        });
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="daily-report-${reportDate}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Daily CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate daily CSV report" });
    }
  });

  // Download monthly report as CSV
  app.get("/api/reports/monthly/:year/:month/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const reportData = await storage.generateMonthlyReport(year, month);
      
      // Generate CSV content
      let csvContent = `Monthly Report - ${reportData.reportPeriod}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary section
      csvContent += `SUMMARY\n`;
      csvContent += `Total Activations,${reportData.summary.totalActivations}\n`;
      csvContent += `Total Recharges,${reportData.summary.totalRecharges}\n`;
      csvContent += `Total Revenue,$${reportData.summary.totalRevenue.toFixed(2)}\n`;
      csvContent += `Total Commissions,$${reportData.summary.totalCommissions.toFixed(2)}\n`;
      csvContent += `Total Users,${reportData.summary.totalUsers}\n`;
      csvContent += `Active Retailers,${reportData.summary.activeRetailers}\n\n`;
      
      // Carrier performance
      csvContent += `CARRIER PERFORMANCE\n`;
      csvContent += `Carrier,Activations,Recharges,Revenue\n`;
      csvContent += `Nexitel Blue,${reportData.carrierPerformance.nexitelBlue.activations},${reportData.carrierPerformance.nexitelBlue.recharges},$${reportData.carrierPerformance.nexitelBlue.revenue.toFixed(2)}\n`;
      csvContent += `Nexitel Purple,${reportData.carrierPerformance.nexitelPurple.activations},${reportData.carrierPerformance.nexitelPurple.recharges},$${reportData.carrierPerformance.nexitelPurple.revenue.toFixed(2)}\n`;
      csvContent += `AT&T,${reportData.carrierPerformance.att.activations},${reportData.carrierPerformance.att.recharges},$${reportData.carrierPerformance.att.revenue.toFixed(2)}\n`;
      csvContent += `Global Recharge,0,${reportData.carrierPerformance.globalRecharge.recharges},$${reportData.carrierPerformance.globalRecharge.revenue.toFixed(2)}\n`;
      csvContent += `USA Carriers,0,${reportData.carrierPerformance.usaCarriers.recharges},$${reportData.carrierPerformance.usaCarriers.revenue.toFixed(2)}\n\n`;
      
      // Daily breakdown
      csvContent += `DAILY BREAKDOWN\n`;
      csvContent += `Date,Activations,Recharges,Revenue\n`;
      reportData.dailyBreakdown.forEach((day: any) => {
        csvContent += `${day.date},${day.activations},${day.recharges},$${day.revenue.toFixed(2)}\n`;
      });
      
      // Commission summary
      if (reportData.commissionSummary.length > 0) {
        csvContent += `\nCOMMISSION SUMMARY\n`;
        csvContent += `Retailer ID,Total Commission,Transaction Count\n`;
        reportData.commissionSummary.forEach((commission: any) => {
          csvContent += `${commission.retailerId},$${commission.totalCommission.toFixed(2)},${commission.transactionCount}\n`;
        });
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${year}-${month.toString().padStart(2, '0')}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Monthly CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate monthly CSV report" });
    }
  });

  // ===== WALLET TRANSACTION REPORTS =====

  // Download daily wallet transaction report
  app.get("/api/reports/wallet/daily/:date", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportDate = req.params.date;
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }

      const walletData = await storage.generateDailyWalletReport(reportDate);
      
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="wallet-transactions-${reportDate}.json"`);
      
      res.json(walletData);
    } catch (error) {
      console.error("Daily wallet report generation error:", error);
      res.status(500).json({ message: "Failed to generate daily wallet report" });
    }
  });

  // Download monthly wallet transaction report
  app.get("/api/reports/wallet/monthly/:year/:month", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const walletData = await storage.generateMonthlyWalletReport(year, month);
      
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="wallet-transactions-${year}-${month.toString().padStart(2, '0')}.json"`);
      
      res.json(walletData);
    } catch (error) {
      console.error("Monthly wallet report generation error:", error);
      res.status(500).json({ message: "Failed to generate monthly wallet report" });
    }
  });

  // Download daily wallet transaction report as CSV
  app.get("/api/reports/wallet/daily/:date/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportDate = req.params.date;
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }

      const walletData = await storage.generateDailyWalletReport(reportDate);
      
      // Generate CSV content
      let csvContent = `Daily Wallet Transactions Report - ${reportDate}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary section
      csvContent += `SUMMARY\n`;
      csvContent += `Total Transactions,${walletData.summary.totalTransactions}\n`;
      csvContent += `Total Amount,$${walletData.summary.totalAmount.toFixed(2)}\n`;
      csvContent += `Customer Deposits,$${walletData.summary.customerDeposits.toFixed(2)}\n`;
      csvContent += `Admin Adjustments,$${walletData.summary.adminAdjustments.toFixed(2)}\n`;
      csvContent += `Retailer Top-ups,$${walletData.summary.retailerTopups.toFixed(2)}\n\n`;
      
      // Transaction details
      if (walletData.transactions.length > 0) {
        csvContent += `TRANSACTION DETAILS\n`;
        csvContent += `Time,User ID,Username,Type,Amount,Purpose,Admin User,Notes\n`;
        walletData.transactions.forEach((transaction: any) => {
          csvContent += `${new Date(transaction.createdAt).toLocaleString()},${transaction.userId || 'N/A'},${transaction.username || 'N/A'},${transaction.type || 'N/A'},$${transaction.amount || '0.00'},"${transaction.purpose || 'N/A'}","${transaction.adminUser || 'N/A'}","${transaction.notes || 'N/A'}"\n`;
        });
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="wallet-transactions-${reportDate}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Daily wallet CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate daily wallet CSV report" });
    }
  });

  // Download monthly wallet transaction report as CSV
  app.get("/api/reports/wallet/monthly/:year/:month/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const walletData = await storage.generateMonthlyWalletReport(year, month);
      
      // Generate CSV content
      let csvContent = `Monthly Wallet Transactions Report - ${walletData.reportPeriod}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary section
      csvContent += `SUMMARY\n`;
      csvContent += `Total Transactions,${walletData.summary.totalTransactions}\n`;
      csvContent += `Total Amount,$${walletData.summary.totalAmount.toFixed(2)}\n`;
      csvContent += `Customer Deposits,$${walletData.summary.customerDeposits.toFixed(2)}\n`;
      csvContent += `Admin Adjustments,$${walletData.summary.adminAdjustments.toFixed(2)}\n`;
      csvContent += `Retailer Top-ups,$${walletData.summary.retailerTopups.toFixed(2)}\n`;
      csvContent += `Unique Users,${walletData.summary.uniqueUsers}\n\n`;
      
      // Daily breakdown
      csvContent += `DAILY BREAKDOWN\n`;
      csvContent += `Date,Transactions,Total Amount,Customer Deposits,Admin Adjustments,Retailer Top-ups\n`;
      walletData.dailyBreakdown.forEach((day: any) => {
        csvContent += `${day.date},${day.transactions},$${day.totalAmount.toFixed(2)},$${day.customerDeposits.toFixed(2)},$${day.adminAdjustments.toFixed(2)},$${day.retailerTopups.toFixed(2)}\n`;
      });
      
      // User activity summary
      if (walletData.userActivity.length > 0) {
        csvContent += `\nUSER ACTIVITY SUMMARY\n`;
        csvContent += `User ID,Username,Transaction Count,Total Amount,Last Transaction\n`;
        walletData.userActivity.forEach((user: any) => {
          csvContent += `${user.userId},"${user.username}",${user.transactionCount},$${user.totalAmount.toFixed(2)},${new Date(user.lastTransaction).toLocaleString()}\n`;
        });
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="wallet-transactions-${year}-${month.toString().padStart(2, '0')}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Monthly wallet CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate monthly wallet CSV report" });
    }
  });

  // ===== RETAILER ACTIVATION REPORTS =====

  // Download daily retailer activation report
  app.get("/api/reports/retailer/daily/:date", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportDate = req.params.date;
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }

      const retailerData = await storage.generateDailyRetailerReport(reportDate);
      
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="retailer-activations-${reportDate}.json"`);
      
      res.json(retailerData);
    } catch (error) {
      console.error("Daily retailer report generation error:", error);
      res.status(500).json({ message: "Failed to generate daily retailer report" });
    }
  });

  // Download monthly retailer activation report
  app.get("/api/reports/retailer/monthly/:year/:month", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const retailerData = await storage.generateMonthlyRetailerReport(year, month);
      
      // Set headers for JSON download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="retailer-activations-${year}-${month.toString().padStart(2, '0')}.json"`);
      
      res.json(retailerData);
    } catch (error) {
      console.error("Monthly retailer report generation error:", error);
      res.status(500).json({ message: "Failed to generate monthly retailer report" });
    }
  });

  // Download daily retailer activation report as CSV
  app.get("/api/reports/retailer/daily/:date/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportDate = req.params.date;
      
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }

      const retailerData = await storage.generateDailyRetailerReport(reportDate);
      
      // Generate CSV content with safe data handling
      let csvContent = `Daily Retailer Activation Report - ${reportDate}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Helper function to safely format numbers
      const safeNumber = (value: any): string => {
        const num = Number(value);
        return isNaN(num) ? "0.00" : num.toFixed(2);
      };
      
      // Summary section
      csvContent += `SUMMARY\n`;
      const summary = retailerData?.summary || {};
      csvContent += `Total Activations,${summary.totalActivations || 0}\n`;
      csvContent += `Total Our Cost,$${safeNumber(summary.totalOurCost)}\n`;
      csvContent += `Total Retailer Cost,$${safeNumber(summary.totalRetailerCost)}\n`;
      csvContent += `Total Profit,$${safeNumber(summary.totalProfit)}\n`;
      csvContent += `Active Retailers,${summary.activeRetailers || 0}\n\n`;
      
      // Retailer breakdown
      const breakdown = retailerData?.retailerBreakdown || [];
      if (breakdown.length > 0) {
        csvContent += `RETAILER BREAKDOWN\n`;
        csvContent += `Retailer Name,Activations,Our Cost,Retailer Cost,Profit\n`;
        breakdown.forEach((retailer: any) => {
          csvContent += `"${retailer?.retailerName || 'Unknown'}",${retailer?.activationCount || 0},$${safeNumber(retailer?.totalOurCost)},$${safeNumber(retailer?.totalRetailerCost)},$${safeNumber(retailer?.totalProfit)}\n`;
        });
      }

      // Activation details - exact format: retailer name, plan, our cost, retailer cost, profit, total
      const details = retailerData?.activationDetails || [];
      if (details.length > 0) {
        csvContent += `\nACTIVATION DETAILS\n`;
        csvContent += `Retailer Name,Plan,Our Cost,Retailer Cost,Profit,Total,Customer Name,Mobile Number,Carrier,Time\n`;
        details.forEach((activation: any) => {
          const createdAt = activation?.createdAt ? new Date(activation.createdAt).toLocaleString() : 'N/A';
          csvContent += `"${activation?.retailerName || 'Unknown'}","${activation?.plan || 'N/A'}",$${safeNumber(activation?.ourCost)},$${safeNumber(activation?.retailerCost)},$${safeNumber(activation?.profit)},$${safeNumber(activation?.total || activation?.retailerCost)},"${activation?.customerName || 'N/A'}","${activation?.mobileNumber || 'N/A'}","${activation?.carrier || 'N/A'}","${createdAt}"\n`;
        });
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="retailer-activations-${reportDate}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Daily retailer CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate daily retailer CSV report" });
    }
  });

  // Download monthly retailer activation report as CSV
  app.get("/api/reports/retailer/monthly/:year/:month/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const retailerData = await storage.generateMonthlyRetailerReport(year, month);
      
      // Generate CSV content
      let csvContent = `Monthly Retailer Activation Report - ${retailerData.reportPeriod}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary section
      csvContent += `SUMMARY\n`;
      csvContent += `Total Activations,${retailerData.summary.totalActivations}\n`;
      csvContent += `Total Our Cost,$${retailerData.summary.totalOurCost.toFixed(2)}\n`;
      csvContent += `Total Retailer Cost,$${retailerData.summary.totalRetailerCost.toFixed(2)}\n`;
      csvContent += `Total Profit,$${retailerData.summary.totalProfit.toFixed(2)}\n`;
      csvContent += `Active Retailers,${retailerData.summary.activeRetailers}\n`;
      csvContent += `Avg Activations per Retailer,${retailerData.summary.avgActivationsPerRetailer.toFixed(1)}\n\n`;
      
      // Daily breakdown
      csvContent += `DAILY BREAKDOWN\n`;
      csvContent += `Date,Activations,Our Cost,Retailer Cost,Profit\n`;
      retailerData.dailyBreakdown.forEach((day: any) => {
        csvContent += `${day.date},${day.activations},$${day.ourCost.toFixed(2)},$${day.retailerCost.toFixed(2)},$${day.profit.toFixed(2)}\n`;
      });
      
      // Retailer performance summary
      if (retailerData.retailerPerformance.length > 0) {
        csvContent += `\nRETAILER PERFORMANCE\n`;
        csvContent += `Retailer Name,Activations,Our Cost,Retailer Cost,Profit,Avg Profit per Activation,Top Carrier,Most Used Plan\n`;
        retailerData.retailerPerformance.forEach((retailer: any) => {
          csvContent += `"${retailer.retailerName}",${retailer.activationCount},$${retailer.totalOurCost.toFixed(2)},$${retailer.totalRetailerCost.toFixed(2)},$${retailer.totalProfit.toFixed(2)},$${retailer.avgProfitPerActivation.toFixed(2)},"${retailer.topCarrier || 'N/A'}","${retailer.mostUsedPlan || 'N/A'}"\n`;
        });
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="retailer-activations-${year}-${month.toString().padStart(2, '0')}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Monthly retailer CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate monthly retailer CSV report" });
    }
  });

  // ===== RETAILER PROFILE REPORTS =====

  // Get retailer profile report data
  app.get("/api/reports/retailer/profiles", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportData = await storage.generateRetailerProfileReport();
      res.json(reportData);
    } catch (error) {
      console.error("Retailer profile report error:", error);
      res.status(500).json({ message: "Failed to generate retailer profile report" });
    }
  });

  // Download retailer profile report as CSV
  app.get("/api/reports/retailer/profiles/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const reportData = await storage.generateRetailerProfileReport();
      
      // Generate CSV content
      let csvContent = `Retailer Profile Report\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary section
      csvContent += `SUMMARY\n`;
      csvContent += `Total Retailers,${reportData.totalRetailers}\n`;
      csvContent += `Active Retailers,${reportData.activeRetailers}\n`;
      csvContent += `Total Balance,$${reportData.totalBalance}\n\n`;
      
      // Retailer details - exact format: retailer ID, name, full address, email, phone, business registration, balance
      csvContent += `RETAILER DETAILS\n`;
      csvContent += `Retailer ID,Username,Full Name,Email Address,Phone Number,Full Address,Business Registration Number,Current Balance,Status,Join Date\n`;
      
      reportData.retailers.forEach((retailer: any) => {
        csvContent += `${retailer.retailerId},"${retailer.username}","${retailer.fullName}","${retailer.email}","${retailer.phoneNumber}","${retailer.fullAddress}","${retailer.businessRegistrationNumber}",$${retailer.currentBalance},"${retailer.status}","${retailer.joinDate}"\n`;
      });

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="retailer-profiles-${new Date().toISOString().split('T')[0]}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Retailer profile CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate retailer profile CSV report" });
    }
  });

  // ===== MONTHLY RECHARGE REPORTS =====

  // Get monthly recharge report data
  app.get("/api/reports/recharge/monthly/:year/:month", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const reportData = await storage.generateMonthlyRechargeReport(year, month);
      res.json(reportData);
    } catch (error) {
      console.error("Monthly recharge report error:", error);
      res.status(500).json({ message: "Failed to generate monthly recharge report" });
    }
  });

  // Download monthly recharge report as CSV
  app.get("/api/reports/recharge/monthly/:year/:month/csv", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      // Validate year and month
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid year or month" });
      }

      const reportData = await storage.generateMonthlyRechargeReport(year, month);
      
      // Helper function to safely format numbers
      const safeNumber = (value: any): string => {
        const num = Number(value);
        return isNaN(num) ? "0.00" : num.toFixed(2);
      };
      
      // Generate CSV content
      let csvContent = `Monthly Recharge Report - ${reportData.reportPeriod}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      // Summary section
      csvContent += `SUMMARY\n`;
      csvContent += `Total Recharges,${reportData.summary?.totalRecharges || 0}\n`;
      csvContent += `Total Our Cost,$${safeNumber(reportData.summary?.totalOurCost)}\n`;
      csvContent += `Total Retailer Cost,$${safeNumber(reportData.summary?.totalRetailerCost)}\n`;
      csvContent += `Total Profit,$${safeNumber(reportData.summary?.totalProfit)}\n`;
      csvContent += `Active Retailers,${reportData.summary?.activeRetailers || 0}\n\n`;
      
      // Retailer breakdown
      const breakdown = reportData?.retailerBreakdown || [];
      if (breakdown.length > 0) {
        csvContent += `RETAILER BREAKDOWN\n`;
        csvContent += `Retailer Name,Total Recharges,Our Cost,Retailer Cost,Profit\n`;
        breakdown.forEach((retailer: any) => {
          csvContent += `"${retailer?.retailerName || 'Unknown'}",${retailer?.totalRecharges || 0},$${safeNumber(retailer?.totalOurCost)},$${safeNumber(retailer?.totalRetailerCost)},$${safeNumber(retailer?.totalProfit)}\n`;
        });
      }

      // Recharge details - exact format: retailer name, total recharge, our cost, retailer cost, profit, plan SKU
      const details = reportData?.rechargeDetails || [];
      if (details.length > 0) {
        csvContent += `\nRECHARGE DETAILS\n`;
        csvContent += `Retailer Name,Phone Number,Plan Name,Plan SKU,Our Cost,Retailer Cost,Profit,Carrier,Date\n`;
        details.forEach((recharge: any) => {
          const createdAt = recharge?.createdAt ? new Date(recharge.createdAt).toLocaleDateString() : 'N/A';
          csvContent += `"${recharge?.retailerName || 'Unknown'}","${recharge?.phoneNumber || 'N/A'}","${recharge?.planName || 'N/A'}","${recharge?.planSku || 'N/A'}",$${safeNumber(recharge?.ourCost)},$${safeNumber(recharge?.retailerCost)},$${safeNumber(recharge?.profit)},"${recharge?.carrier || 'N/A'}","${createdAt}"\n`;
        });
      }

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-recharge-report-${year}-${month.toString().padStart(2, '0')}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("Monthly recharge CSV report generation error:", error);
      res.status(500).json({ message: "Failed to generate monthly recharge CSV report" });
    }
  });

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Get all Nexitel activations
  app.get("/api/nexitel-activations", requireAuth, async (req: Request, res: Response) => {
    try {
      const currentUser = req.session?.user;
      let activations;
      
      if (currentUser?.role === 'retailer') {
        // Retailers see only their own activations
        activations = await storage.getNexitelActivationsByUser(currentUser.id);
      } else {
        // Admin and employees see all activations
        activations = await storage.getAllNexitelActivations();
      }
      
      res.json(activations);
    } catch (error) {
      console.error("Get Nexitel activations error:", error);
      res.status(500).json({ message: "Failed to fetch Nexitel activations" });
    }
  });

  // ===== NEXITEL ACTIVATION ROUTES =====

  // Nexitel activation endpoint
  app.post("/api/nexitel/activate", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const activationData = req.body;
      
      // Validate required fields
      const requiredFields = ['iccid', 'simType', 'nexitelNetwork', 'plan', 'planDuration', 'firstName', 'lastName', 'address', 'state', 'zipCode', 'email'];
      const missingFields = requiredFields.filter(field => !activationData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        });
      }

      // Create activation record
      const activationRecord = {
        userId: req.session.user!.id,
        iccid: activationData.iccid,
        mobileNumber: "", // Will be assigned by carrier
        sku: `NEXITEL-${activationData.nexitelNetwork.toUpperCase()}-${activationData.plan.toUpperCase()}`,
        carrier: activationData.nexitelNetwork,
        serviceType: "nexitel",
        customerName: `${activationData.firstName} ${activationData.lastName}`,
        customerAddress: `${activationData.address}, ${activationData.state} ${activationData.zipCode}`,
        city: "", // Can be extracted from address if needed
        state: activationData.state,
        zip: activationData.zipCode,
        email: activationData.email,
        status: "active",
        activationFee: "0.00", // Set based on plan
        dateOfActivation: new Date(),
      };

      const activation = await storage.createActivationRecord(activationRecord);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "nexitel_activation",
        entityId: activation.id.toString(),
        action: "create",
        newValues: activationRecord,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json({ 
        message: "Nexitel activation completed successfully",
        activation,
        assignedPhoneNumber: "Will be provided by carrier" // Placeholder
      });
    } catch (error) {
      console.error("Nexitel activation error:", error);
      res.status(500).json({ message: "Failed to complete Nexitel activation" });
    }
  });

  // ===== NEXITEL WIFI CALLING ROUTES =====

  // Enable WiFi Calling for single customer
  app.post("/api/nexitel/wifi-calling/enable", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const { iccid, customerName, phoneNumber, emergencyAddress } = req.body;
      
      // Validate required fields
      if (!iccid || !customerName || !phoneNumber || !emergencyAddress) {
        return res.status(400).json({ message: "All fields including emergency address are required" });
      }

      // Create WiFi calling activation record
      const wifiCallingRecord = {
        userId: req.session.user!.id,
        iccid,
        mobileNumber: phoneNumber,
        sku: "WIFI-CALLING-ENABLE",
        carrier: "nexitel",
        serviceType: "nexitel",
        customerName,
        customerAddress: `${emergencyAddress.street}, ${emergencyAddress.city}, ${emergencyAddress.state} ${emergencyAddress.zipCode}`,
        city: emergencyAddress.city,
        state: emergencyAddress.state,
        zip: emergencyAddress.zipCode,
        email: "customer@nexitel.com", // Default email for WiFi calling
        status: "active",
        activationFee: "0.00",
        dateOfActivation: new Date(),
      };

      const activation = await storage.createActivationRecord(wifiCallingRecord);

      // Log audit trail
      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "wifi_calling",
        entityId: activation.id.toString(),
        action: "enable",
        newValues: wifiCallingRecord,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.status(201).json({ 
        message: "WiFi Calling enabled successfully",
        activation 
      });
    } catch (error) {
      console.error("WiFi Calling enable error:", error);
      res.status(500).json({ message: "Failed to enable WiFi Calling" });
    }
  });

  // Bulk enable WiFi Calling via CSV upload
  app.post("/api/nexitel/wifi-calling/bulk-enable", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      // Handle multipart form data (CSV file upload)
      const csvContent = req.body.csvData; // This would be processed by multer middleware
      
      if (!csvContent) {
        return res.status(400).json({ message: "CSV file is required" });
      }

      // Parse CSV content (simplified - in real implementation, use proper CSV parser)
      const lines = csvContent.split('\n').filter((line: string) => line.trim());
      const headers = lines[0].split(',').map((h: string) => h.trim());
      const results = [];

      // Expected headers: ICCID, CustomerName, PhoneNumber, Street, City, State, ZipCode
      const requiredHeaders = ['ICCID', 'CustomerName', 'PhoneNumber', 'Street', 'City', 'State', 'ZipCode'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        return res.status(400).json({ 
          message: `Missing required CSV headers: ${missingHeaders.join(', ')}` 
        });
      }

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map((v: string) => v.trim());
          const row: any = {};
          headers.forEach((header: string, index: number) => {
            row[header] = values[index];
          });

          const wifiCallingRecord = {
            userId: req.session.user!.id,
            iccid: row.ICCID,
            mobileNumber: row.PhoneNumber,
            sku: "WIFI-CALLING-ENABLE",
            carrier: "nexitel",
            serviceType: "nexitel",
            customerName: row.CustomerName,
            customerAddress: `${row.Street}, ${row.City}, ${row.State} ${row.ZipCode}`,
            city: row.City,
            state: row.State,
            zip: row.ZipCode,
            email: "customer@nexitel.com", // Default email for WiFi calling
            status: "active",
            activationFee: "0.00",
            dateOfActivation: new Date(),
          };

          const activation = await storage.createActivationRecord(wifiCallingRecord);
          
          results.push({
            success: true,
            iccid: row.ICCID,
            customerName: row.CustomerName,
            phoneNumber: row.PhoneNumber,
            activationId: activation.id
          });

        } catch (error) {
          results.push({
            success: false,
            iccid: lines[i].split(',')[0],
            customerName: lines[i].split(',')[1] || 'Unknown',
            error: error instanceof Error ? error.message : 'Processing failed'
          });
        }
      }

      // Log bulk operation
      await storage.createAuditLog({
        userId: req.session.user!.id,
        entityType: "bulk_wifi_calling",
        entityId: `bulk-${Date.now()}`,
        action: "bulk_enable",
        newValues: { processedCount: results.length, successCount: results.filter(r => r.success).length },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(results);
    } catch (error) {
      console.error("Bulk WiFi Calling enable error:", error);
      res.status(500).json({ message: "Failed to process bulk WiFi Calling enable" });
    }
  });

  // Nexitel Bulk Activation routes
  app.post("/api/nexitel/bulk-activation/upload", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const { csvData, carrier } = req.body;
      
      if (!csvData || !carrier) {
        return res.status(400).json({ error: "CSV data and carrier selection required" });
      }

      // Validate carrier
      if (!["nexitel_blue", "nexitel_purple"].includes(carrier)) {
        return res.status(400).json({ error: "Invalid carrier selection" });
      }

      // In production, this would process the CSV data and make actual API calls to Nexitel
      // For now, we'll return a success response for integration purposes
      const user = req.session.user!;
      
      await storage.createAuditLog({
        userId: user.id,
        entityType: "bulk_activation",
        entityId: `nexitel-${carrier}`,
        action: "create",
        newValues: { carrier, rowsProcessed: Array.isArray(csvData) ? csvData.length : 0 },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json({
        message: "Bulk activation initiated successfully",
        carrier,
        rowsProcessed: Array.isArray(csvData) ? csvData.length : 0
      });
    } catch (error) {
      console.error("Error processing bulk activation:", error);
      res.status(500).json({ error: "Failed to process bulk activation" });
    }
  });

  // AT&T Bulk Activation routes
  app.post("/api/att/bulk-activation", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const { batchName, serviceType, employeeId } = req.body;
      const user = req.session.user!;
      
      if (!batchName || !serviceType || !employeeId) {
        return res.status(400).json({ error: "Batch name, service type, and employee ID are required" });
      }

      // Validate service type
      if (!["prepaid", "postpaid"].includes(serviceType)) {
        return res.status(400).json({ error: "Invalid service type" });
      }

      // Create mock processing status for demo purposes
      const batchId = `att-batch-${Date.now()}`;
      const mockBulkStatus = {
        id: batchId,
        batchName,
        totalRecords: 3, // Mock data - in production this would be from CSV parsing
        processedRecords: 0,
        successfulActivations: 0,
        failedActivations: 0,
        status: "processing" as const,
        errors: [] as string[]
      };

      // Simulate processing progress
      setTimeout(() => {
        mockBulkStatus.processedRecords = 3;
        mockBulkStatus.successfulActivations = 2;
        mockBulkStatus.failedActivations = 1;
        mockBulkStatus.status = "completed";
        mockBulkStatus.errors = ["Invalid ICCID format for record 3"];
      }, 3000);

      // Log bulk operation
      await storage.createAuditLog({
        userId: user.id,
        entityType: "att_bulk_activation",
        entityId: batchId,
        action: "bulk_activation_initiated",
        newValues: { 
          batchName, 
          serviceType, 
          employeeId,
          totalRecords: mockBulkStatus.totalRecords 
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });

      res.json(mockBulkStatus);
    } catch (error) {
      console.error("Error processing AT&T bulk activation:", error);
      res.status(500).json({ error: "Failed to process AT&T bulk activation" });
    }
  });

  // ===== ACTIVITY TRACKING & SEARCH ROUTES =====

  // Search activities by ICCID
  app.get("/api/activities/search/iccid/:iccid", requireAuth, async (req: Request, res: Response) => {
    try {
      const { iccid } = req.params;
      const results = await storage.searchActivitiesByICCID(iccid);
      res.json(results);
    } catch (error) {
      console.error("Search by ICCID error:", error);
      res.status(500).json({ message: "Failed to search activities" });
    }
  });

  // Search activities by mobile number
  app.get("/api/activities/search/mobile/:mobileNumber", requireAuth, async (req: Request, res: Response) => {
    try {
      const { mobileNumber } = req.params;
      const results = await storage.searchActivitiesByMobileNumber(mobileNumber);
      res.json(results);
    } catch (error) {
      console.error("Search by mobile number error:", error);
      res.status(500).json({ message: "Failed to search activities" });
    }
  });

  // Quick search by ICCID
  app.get("/api/activities/search/iccid/:iccid", requireAuth, async (req: Request, res: Response) => {
    try {
      const { iccid } = req.params;
      const results = await storage.searchActivitiesByICCID(iccid);
      res.json(results);
    } catch (error) {
      console.error("ICCID search error:", error);
      res.status(500).json({ message: "Failed to search by ICCID" });
    }
  });

  // Quick search by mobile number
  app.get("/api/activities/search/mobile/:mobileNumber", requireAuth, async (req: Request, res: Response) => {
    try {
      const { mobileNumber } = req.params;
      const results = await storage.searchActivitiesByMobileNumber(mobileNumber);
      res.json(results);
    } catch (error) {
      console.error("Mobile number search error:", error);
      res.status(500).json({ message: "Failed to search by mobile number" });
    }
  });

  // Advanced activity search
  app.post("/api/activities/search", requireAuth, validateBody(activitySearchSchema), async (req: Request, res: Response) => {
    try {
      const searchRequest = req.body;
      const results = await storage.searchActivities(searchRequest);
      res.json(results);
    } catch (error) {
      console.error("Advanced search error:", error);
      res.status(500).json({ message: "Failed to search activities" });
    }
  });

  // ===== REPORT GENERATION ROUTES =====

  // Generate activation report
  app.post("/api/reports/activation", requireAuth, validateBody(reportGenerationSchema), async (req: Request, res: Response) => {
    try {
      const reportRequest = req.body;
      const currentUser = req.session?.user;
      
      // For retailers, limit reports to their own data
      if (currentUser?.role === 'retailer') {
        reportRequest.userId = currentUser.id;
      }
      
      const activations = await storage.generateActivationReport(reportRequest);
      
      // Convert to CSV format
      if (reportRequest.format === 'csv') {
        const csv = [
          'ID,ICCID,IMEI,Mobile Number,SKU,Carrier,Service Type,Customer Name,Customer Address,City,State,ZIP,Email,Comments,Auto Renew,Date of Activation,Status,Activation Fee,Commission,Balance After,Created At',
          ...activations.map(a => 
            `${a.id},"${a.iccid}","${a.imei || ''}","${a.mobileNumber || ''}","${a.sku}","${a.carrier}","${a.serviceType}","${a.customerName}","${a.customerAddress}","${a.city || ''}","${a.state || ''}","${a.zip || ''}","${a.email}","${a.commentsNotes || ''}","${a.autoRenew || ''}","${a.dateOfActivation ? new Date(a.dateOfActivation).toISOString().split('T')[0] : ''}","${a.status}","${a.activationFee}","${a.commission}","${a.balanceAfter}","${new Date(a.createdAt!).toISOString()}"`
          )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=activation_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
      } else {
        res.json(activations);
      }
    } catch (error) {
      console.error("Generate activation report error:", error);
      res.status(500).json({ message: "Failed to generate activation report" });
    }
  });

  // Generate recharge report
  app.post("/api/reports/recharge", requireAuth, validateBody(reportGenerationSchema), async (req: Request, res: Response) => {
    try {
      const reportRequest = req.body;
      const currentUser = req.session?.user;
      
      // For retailers, limit reports to their own data
      if (currentUser?.role === 'retailer') {
        reportRequest.userId = currentUser.id;
      }
      
      const recharges = await storage.generateRechargeReport(reportRequest);
      
      // Convert to CSV format
      if (reportRequest.format === 'csv') {
        const csv = [
          'ID,Mobile Number,ICCID,Country,Carrier,Amount,Service Fee,Total Amount,Commission,Balance After,Status,Recharge Type,Transaction ID,Created At',
          ...recharges.map(r => 
            `${r.id},"${r.mobileNumber}","${r.iccid || ''}","${r.country}","${r.carrier}","${r.amount}","${r.serviceFee}","${r.totalAmount}","${r.commission}","${r.balanceAfter}","${r.status}","${r.rechargeType}","${r.transactionId || ''}","${new Date(r.createdAt!).toISOString()}"`
          )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=recharge_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
      } else {
        res.json(recharges);
      }
    } catch (error) {
      console.error("Generate recharge report error:", error);
      res.status(500).json({ message: "Failed to generate recharge report" });
    }
  });

  // Generate commission report
  app.post("/api/reports/commission", requireAuth, validateBody(reportGenerationSchema), async (req: Request, res: Response) => {
    try {
      const reportRequest = req.body;
      const currentUser = req.session?.user;
      
      // For retailers, limit reports to their own data
      if (currentUser?.role === 'retailer') {
        reportRequest.userId = currentUser.id;
      }
      
      const commissions = await storage.generateCommissionReport(reportRequest);
      
      // Convert to CSV format
      if (reportRequest.format === 'csv') {
        const csv = [
          'ID,Entity Type,Entity ID,Commission Amount,Commission Rate,Base Amount,Status,Created At',
          ...commissions.map(c => 
            `${c.id},"${c.entityType}","${c.entityId}","${c.commissionAmount}","${c.commissionRate}","${c.baseAmount}","${c.status}","${new Date(c.createdAt!).toISOString()}"`
          )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=commission_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
      } else {
        res.json(commissions);
      }
    } catch (error) {
      console.error("Generate commission report error:", error);
      res.status(500).json({ message: "Failed to generate commission report" });
    }
  });

  // Generate wallet topup report
  app.post("/api/reports/wallet-topup", requireAuth, validateBody(reportGenerationSchema), async (req: Request, res: Response) => {
    try {
      const reportRequest = req.body;
      const currentUser = req.session?.user;
      
      // For retailers, limit reports to their own data
      if (currentUser?.role === 'retailer') {
        reportRequest.userId = currentUser.id;
      }
      
      const topups = await storage.generateWalletTopupReport(reportRequest);
      
      // Convert to CSV format
      if (reportRequest.format === 'csv') {
        const csv = [
          'ID,Amount,Method,Reference,Balance Before,Balance After,Status,Notes,Created At',
          ...topups.map(t => 
            `${t.id},"${t.amount}","${t.method}","${t.reference || ''}","${t.balanceBefore}","${t.balanceAfter}","${t.status}","${t.notes || ''}","${new Date(t.createdAt!).toISOString()}"`
          )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=wallet_topup_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
      } else {
        res.json(topups);
      }
    } catch (error) {
      console.error("Generate wallet topup report error:", error);
      res.status(500).json({ message: "Failed to generate wallet topup report" });
    }
  });

  // Object Storage Routes for Document Management

  // Get upload URL for documents
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve protected documents (admin access only)
  app.get("/objects/:objectPath(*)", requireAuth, async (req, res) => {
    const user = req.session.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.status(500).json({ error: "Server error" });
    }
  });

  // Create retailer document record
  app.post("/api/retailer-documents", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { retailerId, documentType, fileName, originalFileName, filePath, fileSize, mimeType } = req.body;
      
      if (!retailerId || !documentType || !fileName || !filePath) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(filePath);

      // Set ACL policy for the document (private, admin access)
      await objectStorageService.trySetObjectEntityAclPolicy(filePath, {
        owner: user.id.toString(),
        visibility: "private",
      });

      const document = await storage.createRetailerDocument({
        retailerId,
        documentType,
        fileName,
        originalFileName,
        filePath: normalizedPath,
        fileSize,
        mimeType,
        uploadedBy: user.id,
        status: 'pending',
      });

      res.json(document);
    } catch (error) {
      console.error("Error creating retailer document:", error);
      res.status(500).json({ error: "Failed to save document" });
    }
  });

  // Get retailer documents
  app.get("/api/retailer-documents/:retailerId", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      const retailerId = parseInt(req.params.retailerId);
      
      if (!user || (user.role !== 'admin' && user.id !== retailerId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const documents = await storage.getRetailerDocuments(retailerId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching retailer documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Update document status (admin only)
  app.patch("/api/retailer-documents/:documentId/status", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      const { status, notes } = req.body;
      
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const document = await storage.updateRetailerDocumentStatus(documentId, status, notes);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      console.error("Error updating document status:", error);
      res.status(500).json({ error: "Failed to update document status" });
    }
  });

  // ===== RETAILER PERMISSIONS ROUTES =====

  // Create retailer permissions
  app.post("/api/retailer-permissions", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const user = req.session.user!;
      const permissionData = {
        ...req.body,
        createdBy: user.id,
        updatedBy: user.id
      };

      const permission = await storage.createRetailerPermission(permissionData);
      res.json(permission);
    } catch (error) {
      console.error("Error creating retailer permissions:", error);
      res.status(500).json({ error: "Failed to create permissions" });
    }
  });

  // Get retailer permissions
  app.get("/api/retailer-permissions/:retailerId", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const retailerId = parseInt(req.params.retailerId);
      
      // Admin can view all permissions, retailers can only view their own
      if (user.role !== 'admin' && user.id !== retailerId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const permission = await storage.getRetailerPermission(retailerId);
      
      // If no permissions exist, return default (all false)
      if (!permission) {
        const defaultPermissions = {
          retailerId,
          voipServiceAccess: false,
          globalRechargeAccess: false,
          usaRechargeAccess: false,
          walletFundingAccess: false,
          maxDailyFunding: "0.00",
          maxMonthlyFunding: "0.00",
          nexitelActivationAccess: false,
          simSwapAccess: false,
          portInAccess: false,
          reportAccess: true,
          bulkActivationAccess: false,
          customLimits: null,
          notes: null
        };
        return res.json(defaultPermissions);
      }

      res.json(permission);
    } catch (error) {
      console.error("Error fetching retailer permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });

  // Update retailer permissions
  app.patch("/api/retailer-permissions/:retailerId", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const user = req.session.user!;
      const retailerId = parseInt(req.params.retailerId);
      
      const updateData = {
        ...req.body,
        updatedBy: user.id
      };

      // Remove retailerId from update data if present
      delete updateData.retailerId;

      let permission = await storage.updateRetailerPermission(retailerId, updateData);
      
      // If no permissions exist, create them
      if (!permission) {
        const newPermissionData = {
          retailerId,
          ...updateData,
          createdBy: user.id
        };
        permission = await storage.createRetailerPermission(newPermissionData);
      }

      res.json(permission);
    } catch (error) {
      console.error("Error updating retailer permissions:", error);
      res.status(500).json({ error: "Failed to update permissions" });
    }
  });

  // Delete retailer permissions
  app.delete("/api/retailer-permissions/:retailerId", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const retailerId = parseInt(req.params.retailerId);
      const success = await storage.deleteRetailerPermission(retailerId);
      
      if (!success) {
        return res.status(404).json({ error: "Permissions not found" });
      }

      res.json({ success: true, message: "Permissions deleted successfully" });
    } catch (error) {
      console.error("Error deleting retailer permissions:", error);
      res.status(500).json({ error: "Failed to delete permissions" });
    }
  });

  // ===== WALLET PERMISSIONS ROUTES (ALIAS FOR RETAILER PERMISSIONS) =====
  
  // Get all wallet permissions (for admin wallet permissions page)
  app.get("/api/admin/wallet-permissions", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const permissions = await storage.getAllRetailerPermissions();
      
      // Transform the retailer permissions data to match frontend expectations
      const walletPermissions = permissions.map(permission => ({
        id: permission.id,
        userId: permission.retailerId,
        canAddFunds: permission.walletFundingAccess,
        maxDailyFunding: permission.maxDailyFunding,
        maxMonthlyFunding: permission.maxMonthlyFunding,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt
      }));

      res.json(walletPermissions);
    } catch (error) {
      console.error("Error fetching wallet permissions:", error);
      res.status(500).json({ error: "Failed to fetch wallet permissions" });
    }
  });

  // Update wallet permissions by user ID
  app.put("/api/admin/wallet-permissions/:userId", requireAuth, requireRole(['admin']), async (req, res) => {
    try {
      const user = req.session.user!;
      const userId = parseInt(req.params.userId);
      
      const updateData = {
        retailerId: userId,
        walletFundingAccess: req.body.canAddFunds || false,
        maxDailyFunding: req.body.maxDailyFunding ? req.body.maxDailyFunding.toString() : "0.00",
        maxMonthlyFunding: req.body.maxMonthlyFunding ? req.body.maxMonthlyFunding.toString() : "0.00",
        updatedBy: user.id
      };

      let permission = await storage.updateRetailerPermission(userId, updateData);
      
      // If no permissions exist, create them
      if (!permission) {
        const newPermissionData = {
          ...updateData,
          createdBy: user.id,
          voipServiceAccess: false,
          globalRechargeAccess: false,
          usaRechargeAccess: false,
          nexitelActivationAccess: false,
          simSwapAccess: false,
          portInAccess: false,
          reportAccess: true,
          bulkActivationAccess: false,
          customLimits: null,
          notes: null
        };
        permission = await storage.createRetailerPermission(newPermissionData);
      }

      // Transform the response to match the frontend's expected format
      const walletPermission = {
        id: permission.id,
        userId: permission.retailerId,
        canAddFunds: permission.walletFundingAccess,
        maxDailyFunding: permission.maxDailyFunding,
        maxMonthlyFunding: permission.maxMonthlyFunding,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt
      };

      res.json(walletPermission);
    } catch (error) {
      console.error("Error updating wallet permissions:", error);
      res.status(500).json({ error: "Failed to update wallet permissions" });
    }
  });

  // Get wallet permissions for a specific retailer (used by retailer portal)
  app.get("/api/wallet/permissions/:userId", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const requestingUser = req.session.user!;
      
      // Only allow retailers to check their own permissions or admins to check any
      if (requestingUser.role !== 'admin' && requestingUser.id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const permission = await storage.getRetailerPermission(userId);
      
      if (!permission) {
        // Return default permissions if none exist
        return res.json({
          canAddFunds: false,
          maxDailyFunding: "0.00",
          maxMonthlyFunding: "0.00"
        });
      }
      
      // Transform to include all permissions for retailer dashboard
      const walletPermission = {
        canAddFunds: permission.walletFundingAccess,
        maxDailyFunding: permission.maxDailyFunding,
        maxMonthlyFunding: permission.maxMonthlyFunding,
        // Service permissions for dashboard filtering
        nexitelActivationAccess: permission.nexitelActivationAccess,
        simSwapAccess: permission.simSwapAccess,
        portInAccess: permission.portInAccess,
        usaRechargeAccess: permission.usaRechargeAccess,
        globalRechargeAccess: permission.globalRechargeAccess,
        voipServiceAccess: permission.voipServiceAccess,
        bulkActivationAccess: permission.bulkActivationAccess,
        reportAccess: permission.reportAccess
      };
      
      res.json(walletPermission);
    } catch (error) {
      console.error("Error fetching wallet permissions:", error);
      res.status(500).json({ error: "Failed to fetch wallet permissions" });
    }
  });

  // ===== COMMISSION MANAGEMENT ROUTES =====

  // Get all commission groups
  app.get("/api/admin/commission-groups", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const groups = await storage.getAllCommissionGroups();
      res.json(groups);
    } catch (error) {
      console.error("Get commission groups error:", error);
      res.status(500).json({ message: "Failed to fetch commission groups" });
    }
  });

  // Create commission group
  app.post("/api/admin/commission-groups", requireAuth, requireRole(["admin"]), validateBody(commissionGroupSchema), async (req: Request, res: Response) => {
    try {
      const group = await storage.createCommissionGroup(req.body);
      res.json(group);
    } catch (error) {
      console.error("Create commission group error:", error);
      res.status(500).json({ message: "Failed to create commission group" });
    }
  });

  // Update commission group
  app.patch("/api/admin/commission-groups/:id", requireAuth, requireRole(["admin"]), validateBody(commissionGroupSchema), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const group = await storage.updateCommissionGroup(id, req.body);
      if (!group) {
        return res.status(404).json({ message: "Commission group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Update commission group error:", error);
      res.status(500).json({ message: "Failed to update commission group" });
    }
  });

  // Delete commission group
  app.delete("/api/admin/commission-groups/:id", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCommissionGroup(id);
      if (!success) {
        return res.status(404).json({ message: "Commission group not found" });
      }
      res.json({ message: "Commission group deleted successfully" });
    } catch (error) {
      console.error("Delete commission group error:", error);
      res.status(500).json({ message: "Failed to delete commission group" });
    }
  });

  // Get all commission pricing
  app.get("/api/admin/commission-pricing", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const pricing = await storage.getAllCommissionPricing();
      res.json(pricing);
    } catch (error) {
      console.error("Get commission pricing error:", error);
      res.status(500).json({ message: "Failed to fetch commission pricing" });
    }
  });

  // Create commission pricing - Fixed validation issue
  app.post("/api/admin/commission-pricing", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      console.log("=== COMMISSION PRICING FIXED ROUTE ===");
      console.log("Raw request body received:", JSON.stringify(req.body, null, 2));
      
      // Manual validation without schema (proven working solution)
      const { commissionGroupId, planId, ourCost, sellingPrice } = req.body;
      
      if (!commissionGroupId || !planId || ourCost === undefined || sellingPrice === undefined) {
        console.log("Missing required fields validation failed");
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      if (sellingPrice <= ourCost) {
        console.log("Selling price validation failed");
        return res.status(400).json({ message: "Selling price must be greater than our cost" });
      }
      
      // Get the plan to extract the customer price (denomination)
      const plan = await storage.getPlanById(parseInt(planId));
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      // Parse denomination to get numeric value
      const customerPrice = parseFloat(plan.denomination.toString().replace('$', ''));
      
      // Calculate profit (retailer commission = customer_price - selling_price)
      const profit = parseFloat((customerPrice - sellingPrice).toFixed(2));
      console.log("Calculated profit:", profit);
      console.log("Customer price from plan denomination:", customerPrice);
      
      // Convert values to strings to match storage expectations
      const pricingData = {
        commissionGroupId: parseInt(commissionGroupId),
        planId: parseInt(planId),
        ourCost: ourCost.toString(),
        sellingPrice: sellingPrice.toString(),
        customerPrice: customerPrice.toString(),
        profit: profit.toString(),
        isActive: true,
      };

      console.log("Final pricing data being sent to storage:", JSON.stringify(pricingData, null, 2));

      const pricing = await storage.createCommissionPricing(pricingData);
      console.log("Storage returned:", JSON.stringify(pricing, null, 2));
      res.json(pricing);
    } catch (error) {
      console.error("Create commission pricing error:", error);
      res.status(500).json({ message: "Failed to create commission pricing" });
    }
  });

  // Get admin plans (for commission management)
  app.get("/api/admin/plans", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error("Get admin plans error:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // TEST ROUTE - Commission pricing with different endpoint name
  app.post("/api/admin/commission-pricing-test", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      console.log("=== TEST ROUTE - COMMISSION PRICING DEBUG ===");
      console.log("Raw request body received:", JSON.stringify(req.body, null, 2));
      
      // Manual validation without schema
      const { commissionGroupId, planId, ourCost, sellingPrice } = req.body;
      
      if (!commissionGroupId || !planId || ourCost === undefined || sellingPrice === undefined) {
        console.log("Missing required fields validation failed");
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      if (sellingPrice <= ourCost) {
        console.log("Selling price validation failed");
        return res.status(400).json({ message: "Selling price must be greater than our cost" });
      }
      
      // Calculate profit
      const profit = parseFloat((sellingPrice - ourCost).toFixed(2));
      console.log("Calculated profit:", profit);
      
      const pricingData = {
        commissionGroupId: parseInt(commissionGroupId),
        planId: parseInt(planId),
        ourCost: ourCost.toString(),
        sellingPrice: sellingPrice.toString(),
        profit: profit.toString(),
        isActive: true,
      };

      console.log("Final pricing data being sent to storage:", JSON.stringify(pricingData, null, 2));

      const pricing = await storage.createCommissionPricing(pricingData);
      console.log("Storage returned:", JSON.stringify(pricing, null, 2));
      res.json(pricing);
    } catch (error) {
      console.error("Test commission pricing error:", error);
      res.status(500).json({ message: "Failed to create commission pricing (test route)" });
    }
  });

  // ===== AT&T SERVICES ROUTES =====

  // Get all AT&T plans (filtered for service_type = 'att')
  app.get("/api/att/plans", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const plans = await storage.getPlansByServiceType("att");
      res.json(plans);
    } catch (error) {
      console.error("Get AT&T plans error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T plans" });
    }
  });

  // Create AT&T activation
  app.post("/api/att/activations", requireAuth, requireRole(["admin", "employee", "retailer"]), validateBody(insertAttActivationSchema), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const activationData = {
        ...req.body,
        activatedBy: user.id,
      };
      
      const activation = await storage.createAttActivation(activationData);
      res.json(activation);
    } catch (error) {
      console.error("Create AT&T activation error:", error);
      res.status(500).json({ message: "Failed to create AT&T activation" });
    }
  });

  // Create AT&T data add-on
  app.post("/api/att/data-addon", requireAuth, requireRole(["admin", "employee", "retailer"]), validateBody(insertAttDataAddonSchema), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const dataAddonData = {
        ...req.body,
        requestedBy: user.id,
        status: "pending",
        requestDate: new Date().toISOString(),
      };
      
      const dataAddon = await storage.createAttDataAddon(dataAddonData);
      
      await storage.createAuditLog({
        userId: user.id,
        entityType: "att_data_addon",
        entityId: dataAddon.id.toString(),
        action: "create",
        newValues: dataAddon,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.json(dataAddon);
    } catch (error) {
      console.error("Create AT&T data add-on error:", error);
      res.status(500).json({ message: "Failed to create AT&T data add-on" });
    }
  });

  // Get all AT&T activations (admin/employee view)
  app.get("/api/att/activations", requireAuth, requireRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
      const activations = await storage.getAllAttActivations();
      res.json(activations);
    } catch (error) {
      console.error("Get AT&T activations error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T activations" });
    }
  });

  // Get AT&T activations by user (retailer view)
  app.get("/api/att/activations/my", requireAuth, requireRole(["retailer"]), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const activations = await storage.getAttActivationsByUser(user.id);
      res.json(activations);
    } catch (error) {
      console.error("Get user AT&T activations error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T activations" });
    }
  });

  // Update AT&T activation status
  app.patch("/api/att/activations/:id/status", requireAuth, requireRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, phoneNumber } = req.body;
      
      const activation = await storage.updateAttActivationStatus(id, status, phoneNumber);
      if (!activation) {
        return res.status(404).json({ message: "AT&T activation not found" });
      }
      res.json(activation);
    } catch (error) {
      console.error("Update AT&T activation status error:", error);
      res.status(500).json({ message: "Failed to update AT&T activation status" });
    }
  });

  // Create AT&T data add-on
  app.post("/api/att/data-addons", requireAuth, requireRole(["admin", "employee", "retailer"]), validateBody(insertAttDataAddonSchema), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const addonData = {
        ...req.body,
        soldBy: user.id,
      };
      
      const addon = await storage.createAttDataAddon(addonData);
      res.json(addon);
    } catch (error) {
      console.error("Create AT&T data addon error:", error);
      res.status(500).json({ message: "Failed to create AT&T data addon" });
    }
  });

  // Get AT&T data add-ons by phone number
  app.get("/api/att/data-addons/:phoneNumber", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const phoneNumber = req.params.phoneNumber;
      const addons = await storage.getAttDataAddons(phoneNumber);
      res.json(addons);
    } catch (error) {
      console.error("Get AT&T data addons error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T data addons" });
    }
  });

  // Create AT&T SIM swap
  app.post("/api/att/sim-swaps", requireAuth, requireRole(["admin", "employee", "retailer"]), validateBody(insertAttSimSwapSchema), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const swapData = {
        ...req.body,
        processedBy: user.id,
      };
      
      const swap = await storage.createAttSimSwap(swapData);
      res.json(swap);
    } catch (error) {
      console.error("Create AT&T SIM swap error:", error);
      res.status(500).json({ message: "Failed to create AT&T SIM swap" });
    }
  });

  // Get all AT&T SIM swaps
  app.get("/api/att/sim-swaps", requireAuth, requireRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
      const swaps = await storage.getAllAttSimSwaps();
      res.json(swaps);
    } catch (error) {
      console.error("Get AT&T SIM swaps error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T SIM swaps" });
    }
  });

  // Create AT&T recharge
  app.post("/api/att/recharges", requireAuth, requireRole(["admin", "employee", "retailer"]), validateBody(insertAttRechargeSchema), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const rechargeData = {
        ...req.body,
        rechargedBy: user.id,
      };
      
      const recharge = await storage.createAttRecharge(rechargeData);
      res.json(recharge);
    } catch (error) {
      console.error("Create AT&T recharge error:", error);
      res.status(500).json({ message: "Failed to create AT&T recharge" });
    }
  });

  // Get all AT&T recharges (admin/employee view)
  app.get("/api/att/recharges", requireAuth, requireRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
      const recharges = await storage.getAllAttRecharges();
      res.json(recharges);
    } catch (error) {
      console.error("Get AT&T recharges error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T recharges" });
    }
  });

  // Get AT&T recharges by user (retailer view)
  app.get("/api/att/recharges/my", requireAuth, requireRole(["retailer"]), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const recharges = await storage.getAttRechargesByUser(user.id);
      res.json(recharges);
    } catch (error) {
      console.error("Get user AT&T recharges error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T recharges" });
    }
  });

  // Create AT&T bulk activation
  app.post("/api/att/bulk-activations", requireAuth, requireRole(["admin", "employee"]), validateBody(insertAttBulkActivationSchema), async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const bulkData = {
        ...req.body,
        uploadedBy: user.id,
      };
      
      const bulk = await storage.createAttBulkActivation(bulkData);
      res.json(bulk);
    } catch (error) {
      console.error("Create AT&T bulk activation error:", error);
      res.status(500).json({ message: "Failed to create AT&T bulk activation" });
    }
  });

  // Get all AT&T bulk activations
  app.get("/api/att/bulk-activations", requireAuth, requireRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
      const bulkActivations = await storage.getAllAttBulkActivations();
      res.json(bulkActivations);
    } catch (error) {
      console.error("Get AT&T bulk activations error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T bulk activations" });
    }
  });

  // Get/Create retailer AT&T permissions
  app.get("/api/att/permissions/:userId", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.session.user!;
      const userId = parseInt(req.params.userId);
      
      // Admin can view all permissions, retailers can only view their own
      if (user.role !== 'admin' && user.id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const permission = await storage.getRetailerAttPermission(userId);
      
      if (!permission) {
        // Create default permissions if none exist
        const defaultPermission = {
          userId,
          canActivate: false,
          canRecharge: false,
          canSimSwap: false,
          canSellDataAddons: false,
          canPortIn: false,
          canEnableWifiCalling: false,
          canBulkActivate: false,
          maxDailyActivations: 100,
          maxDailyRecharges: 500,
        };
        
        const newPermission = await storage.createRetailerAttPermission(defaultPermission);
        return res.json(newPermission);
      }
      
      res.json(permission);
    } catch (error) {
      console.error("Get AT&T permissions error:", error);
      res.status(500).json({ message: "Failed to fetch AT&T permissions" });
    }
  });

  // Update retailer AT&T permissions
  app.put("/api/att/permissions/:userId", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      
      const permission = await storage.updateRetailerAttPermission(userId, updates);
      if (!permission) {
        return res.status(404).json({ message: "AT&T permissions not found" });
      }
      
      res.json(permission);
    } catch (error) {
      console.error("Update AT&T permissions error:", error);
      res.status(500).json({ message: "Failed to update AT&T permissions" });
    }
  });

  // ===== NEW NEXITEL SERVICES ROUTES =====

  // Nexitel Data Add-ons
  app.post("/api/nexitel/data-addons", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const { phoneNumber, iccid, dataPackage, customerEmail, employeeId } = req.body;
      
      // Employee verification
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      const dataAddon = {
        id: Date.now(),
        phoneNumber,
        iccid,
        dataPackage,
        customerEmail: customerEmail || "",
        employeeId,
        status: "active",
        purchasedAt: new Date().toISOString()
      };
      
      console.log("Nexitel Data Add-on Created:", dataAddon);
      
      res.json({ 
        success: true, 
        phoneNumber,
        dataPackage,
        purchasedAt: dataAddon.purchasedAt
      });
    } catch (error) {
      console.error("Nexitel data add-on error:", error);
      res.status(500).json({ error: "Failed to purchase data add-on" });
    }
  });

  // Nexitel SIM Swap
  app.post("/api/nexitel/sim-swap", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const { phoneNumber, oldIccid, newIccid, reason, customerEmail, notes, employeeId } = req.body;
      
      // Employee verification
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      const simSwap = {
        id: Date.now(),
        phoneNumber,
        oldIccid,
        newIccid,
        reason,
        customerEmail: customerEmail || "",
        notes: notes || "",
        employeeId,
        status: "completed",
        swappedAt: new Date().toISOString()
      };
      
      console.log("Nexitel SIM Swap Created:", simSwap);
      
      res.json({ 
        success: true, 
        phoneNumber,
        newIccid,
        swappedAt: simSwap.swappedAt
      });
    } catch (error) {
      console.error("Nexitel SIM swap error:", error);
      res.status(500).json({ error: "Failed to process SIM swap" });
    }
  });

  // Nexitel Port Status
  app.post("/api/nexitel/port-status", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const { searchQuery, employeeId } = req.body;
      
      // Employee verification
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      // Mock port status data - in production this would query actual porting system
      const mockPortData = {
        id: `PORT_${Date.now()}`,
        phoneNumber: searchQuery.replace(/\D/g, '').slice(0, 10),
        fromCarrier: "Verizon Wireless",
        requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: ["pending", "in-progress", "completed"][Math.floor(Math.random() * 3)] as "pending" | "in-progress" | "completed",
        estimatedCompletion: new Date(Date.now() + 86400000 * 3).toISOString(),
        customerName: "John Doe",
        customerEmail: "john.doe@email.com",
        notes: "Standard wireless port request"
      };
      
      console.log("Nexitel Port Status Query:", { searchQuery, employeeId });
      
      res.json(mockPortData);
    } catch (error) {
      console.error("Nexitel port status error:", error);
      res.status(500).json({ error: "Failed to retrieve port status" });
    }
  });

  // Nexitel Bulk Activation
  app.post("/api/nexitel/bulk-activation", requireAuth, requireRole(["admin", "employee", "retailer"]), async (req: Request, res: Response) => {
    try {
      const { batchName, nexitelNetwork, employeeId } = req.body;

      // Employee verification
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      // Mock processing - in production this would process the actual CSV
      const mockBulkStatus = {
        id: `BULK_${Date.now()}`,
        batchName,
        nexitelNetwork,
        employeeId,
        totalRecords: Math.floor(Math.random() * 50) + 10,
        processedRecords: 0,
        successfulActivations: 0,
        failedActivations: 0,
        status: "processing" as const,
        errors: [] as string[]
      };
      
      // Simulate processing progress
      setTimeout(() => {
        mockBulkStatus.processedRecords = mockBulkStatus.totalRecords;
        mockBulkStatus.successfulActivations = Math.floor(mockBulkStatus.totalRecords * 0.9);
        mockBulkStatus.failedActivations = mockBulkStatus.totalRecords - mockBulkStatus.successfulActivations;
        mockBulkStatus.status = "completed";
      }, 3000);
      
      console.log("Nexitel Bulk Activation Started:", mockBulkStatus);
      
      res.json(mockBulkStatus);
    } catch (error) {
      console.error("Nexitel bulk activation error:", error);
      res.status(500).json({ error: "Failed to process bulk activation" });
    }
  });

  // ============== PROFIT PAYOUT ROUTES ==============
  
  // Get profit balance summary
  app.get("/api/profit/balance", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      // Calculate total profit from transactions, activations, etc.
      const totalProfit = await storage.calculateTotalProfit();
      const availableBalance = await storage.getTotalBalance();
      
      res.json({
        totalProfit,
        availableBalance,
        profitBalance: totalProfit // For now, profit balance equals total profit
      });
    } catch (error) {
      console.error("Error getting profit balance:", error);
      res.status(500).json({ error: "Failed to get profit balance" });
    }
  });
  
  // Get profit payout history
  app.get("/api/profit/payouts", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const payouts = await storage.getProfitPayouts();
      res.json(payouts);
    } catch (error) {
      console.error("Error getting profit payouts:", error);
      res.status(500).json({ error: "Failed to get profit payouts" });
    }
  });
  
  // Create new profit payout
  app.post("/api/profit/payouts", requireAuth, requireRole(["admin"]), validateBody(insertProfitPayoutSchema), async (req: Request, res: Response) => {
    try {
      const { amount, payoutMethod, recipientDetails, reference, notes, employeeId } = req.body;
      const adminUser = req.session!.user!;
      
      // Verify employee ID for admin operations
      if (!employeeId || employeeId !== adminUser.employeeId) {
        return res.status(400).json({ error: "Employee verification required for payout operations" });
      }
      
      // Get current balances
      const currentProfitBalance = await storage.calculateTotalProfit();
      const currentMainBalance = await storage.getTotalBalance();
      
      // Validate sufficient balance
      if (currentProfitBalance < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient profit balance for payout" });
      }
      
      if (currentMainBalance < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient main balance for payout" });
      }
      
      // Create payout record
      const payout = await storage.createProfitPayout({
        processedBy: adminUser.id,
        employeeId,
        amount,
        payoutMethod,
        recipientDetails,
        reference,
        notes,
        profitBalanceBefore: currentProfitBalance.toString(),
        profitBalanceAfter: (currentProfitBalance - parseFloat(amount)).toString(),
        mainBalanceBefore: currentMainBalance.toString(),
        mainBalanceAfter: (currentMainBalance - parseFloat(amount)).toString(),
        status: "pending"
      });
      
      // Deduct from main balance (this affects the actual available balance)
      await storage.deductFromMainBalance(parseFloat(amount), `Profit payout #${payout.id}`);
      
      res.json(payout);
    } catch (error) {
      console.error("Error creating profit payout:", error);
      res.status(500).json({ error: "Failed to create profit payout" });
    }
  });
  
  // Update payout status
  app.patch("/api/profit/payouts/:id", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      const payout = await storage.updateProfitPayoutStatus(parseInt(id), status, notes);
      res.json(payout);
    } catch (error) {
      console.error("Error updating payout status:", error);
      res.status(500).json({ error: "Failed to update payout status" });
    }
  });

  return app;
}