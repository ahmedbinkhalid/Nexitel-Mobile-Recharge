# Overview

This is a Phone Recharge/Top-up Point of Sale (POS) system designed to manage mobile phone recharging services. It provides role-based functionality for admins, employees, retailers, and customers. The system aims to offer a modern web experience with a full-stack TypeScript implementation, a React frontend, an Express backend, and PostgreSQL for data persistence via Drizzle ORM. Key capabilities include comprehensive reporting for retailer activations, wallet transactions, and general analytics, multi-carrier support, and a robust balance management system.

# User Preferences

```
Preferred communication style: Simple, everyday language.
```

# System Architecture

The application adopts a monorepo structure, separating frontend, backend, and shared components.

**Frontend Architecture:**
- **Technology:** React with TypeScript, Vite for bundling.
- **State Management:** TanStack Query for server state.
- **Routing:** Wouter for client-side routing.
- **Styling:** Tailwind CSS with shadcn/ui components.
- **Authentication:** Role-based authentication and authorization.
- **UI/UX:** Features a clean, professional layout with improved form designs, dedicated clean components for specific services, and a focus on user-friendly interfaces (e.g., simple SIM swap forms, centered layouts). Reports page utilizes grid layouts (2x2, 3-column) with specific branding.

**Backend Architecture:**
- **Technology:** Express.js server with TypeScript.
- **API Design:** RESTful API with route-based organization.
- **Data Storage:** Memory storage implementation with an interface for future database integration.
- **Middleware:** Includes logging, error handling, and request processing.

**Database Layer:**
- **ORM:** Drizzle ORM for type-safe operations.
- **Database:** PostgreSQL (configured for Neon serverless).
- **Schema:** Schema-first approach with Zod validation.

**Core System Design:**
- **Subdomain Routing:**
    - `staff.domain.com`: Staff portal for admin, employee, and retailer, offering Nexitel services (activation, recharge, reports, SIM swap, port-in), Global Recharge, and authentication with role-based permissions.
    - `customer.domain.com`: Public customer portal for international mobile recharge services without login, featuring country/carrier selection and a user-friendly interface.
- **Authentication System:** Username/password-based login for staff, role-based access control (admin, employee, retailer), local storage for session persistence, and protected routes.
- **User Management:** Supports three staff user roles with distinct permissions, including employee sub-categorization, user creation, and active/inactive status tracking.
- **Balance Management System:** Admin main balance oversight, individual retailer portal balances, dual deduction system for transactions, real-time tracking, insufficient balance protection, and clear balance display.
- **Transaction System:** Processes mobile phone recharges with global coverage across six regions, country-specific carrier support, service fee calculation, and transaction status tracking.
- **Saved Numbers Feature:** Allows users to save frequently used phone numbers with labels, country, and carrier associations.
- **Permissions System:** Role-based permissions using a junction table for granular control and admin override capabilities.
- **Key Architectural Decisions:** Monorepo structure for shared types, memory storage interface for database flexibility, role-based architecture for scalability, type-safe database layer with Drizzle ORM, and component-based UI using shadcn/ui.

# External Dependencies

**Frontend Dependencies:**
- **UI Components:** Radix UI primitives with shadcn/ui.
- **Form Handling:** React Hook Form with Zod validation.
- **State Management:** TanStack Query.
- **Styling:** Tailwind CSS.
- **Icons:** Lucide React.

**Backend Dependencies:**
- **Database:** Neon serverless PostgreSQL.
- **ORM:** Drizzle with Zod schema validation.
- **Session Storage:** connect-pg-simple for PostgreSQL session store.
- **Development:** tsx for TypeScript execution.

**Build Tools:**
- **Frontend:** Vite.
- **Backend:** esbuild for production bundling.