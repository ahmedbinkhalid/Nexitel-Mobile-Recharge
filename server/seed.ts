import "dotenv/config";
import { db } from "./db";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Create admin user
    await storage.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@system.com",
      role: "admin",
      balance: "10000.00",
      isActive: true,
    });
    console.log("✓ Admin user created");

    // Create sample employee
    await storage.createUser({
      username: "employee1",
      password: "employee123",
      email: "employee@system.com",
      role: "employee",
      employeeRole: "technical_support",
      balance: "1000.00",
      isActive: true,
    });
    console.log("✓ Employee user created");

    // Create sample retailer
    await storage.createUser({
      username: "retailer1",
      password: "retailer123",
      email: "retailer@system.com",
      role: "retailer",
      balance: "500.00",
      isActive: true,
    });
    console.log("✓ Retailer user created");

    // Create commission group
    const commissionGroup = await storage.createCommissionGroup({
      name: "Standard Retailers",
      description: "Standard commission rates for most retailers",
    });
    console.log("✓ Commission group created");

    // Create sample plans
    const nexitelPlan = await storage.createPlan({
      name: "Nexitel Purple $25",
      carrier: "nexitel-purple",
      country: "United States",
      denomination: "$25",
      retailerPrice: "27.50",
      ourCost: "24.00",
      profit: "3.50",
      serviceType: "nexitel",
      planType: "prepaid",
      description: "25 dollar prepaid plan for Nexitel Purple network",
      isActive: true,
    });

    const globalPlan = await storage.createPlan({
      name: "India Airtel $10",
      carrier: "airtel",
      country: "India",
      denomination: "$10",
      retailerPrice: "11.00",
      ourCost: "9.50",
      profit: "1.50",
      serviceType: "global_recharge",
      planType: "prepaid",
      description: "10 dollar prepaid recharge for Airtel India",
      isActive: true,
    });

    const voipPlan = await storage.createPlan({
      name: "VoIP Basic Plan",
      carrier: "nexitel-voip",
      country: "United States",
      denomination: "Monthly",
      retailerPrice: "15.00",
      ourCost: "12.00",
      profit: "3.00",
      serviceType: "voip",
      planType: "voice",
      description: "Basic VoIP plan with unlimited domestic calling",
      isActive: true,
    });

    console.log("✓ Sample plans created");

    // Create commission pricing for the retailer
    await storage.createCommissionPricing({
      commissionGroupId: commissionGroup.id,
      planId: nexitelPlan.id,
      ourCost: "24.00",
      sellingPrice: "26.00",
      profit: "2.00",
      isActive: true,
    });

    await storage.createCommissionPricing({
      commissionGroupId: commissionGroup.id,
      planId: globalPlan.id,
      ourCost: "9.50",
      sellingPrice: "10.50",
      profit: "1.00",
      isActive: true,
    });

    console.log("✓ Commission pricing created");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin / admin123");
    console.log("Employee: employee1 / employee123");
    console.log("Retailer: retailer1 / retailer123");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// ✅ Always run on direct execution
seed().then(() => process.exit(0));

export { seed };
