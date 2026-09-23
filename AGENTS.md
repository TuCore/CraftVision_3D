# CraftVision 3D - Rules and Guidelines

Welcome to CraftVision 3D! When working on this repository, please strictly adhere to the following rules and architectural constraints. Do not deviate from these patterns without explicit user permission.

## 1. Architectural Boundaries (Monorepo)
- **Separation of Concerns:** Do not mix frontend and backend code.
  - Frontend code goes ONLY to `/frontend`.
  - Backend code goes ONLY to `/backend`.
  - Infrastructure and CI/CD configs go to `/infrastructure`, `/docker`, and `/.github`.
  - Databases and migrations go to `/databases`.
- **API First Approach:** Any new API feature must first be designed and documented in `/api-specs` (OpenAPI/Swagger) before writing the backend implementation.

## 2. Backend Guidelines (.NET)
- **Microservices & Clean Architecture:** The backend relies on a microservices architecture.
  - Core logic goes to `/backend/src/Services`.
  - Shared logic and common utilities MUST go into `/backend/src/BuildingBlocks` and be consumed by services.
  - Do NOT bypass the Gateway. Frontend MUST always call the Gateway (`/backend/src/Gateway`), never the backend services directly.
- **Database per Service:** Each microservice should own its data. Do not make direct queries to another service's database. Use asynchronous communication (RabbitMQ/Kafka) for cross-service data events.

## 3. Frontend Guidelines (Next.js)
- **Component Structure:** Use the `src/` directory for all Next.js code.
- **State Management:** Use modern React paradigms. Keep 3D processing (Three.js/WebGL) separated from pure UI components.
- **Styling:** Follow the existing CSS/Tailwind configuration inside the frontend folder.

## 4. Documentation & Language
- **Code Comments & Variable Names:** Must be written in **English**.
- **User Documentation:** Files inside `/docs` or `README.md` can be written in **Vietnamese** or English, depending on user preference.
- Do not remove or alter existing architectural docs in `/docs` without reviewing them first.

## 5. Tooling Constraints
- When using terminal commands to create or modify files, always prefer specific IDE tools (e.g., `write_to_file`, `replace_file_content`, `multi_replace_file_content`) over using generic bash/powershell commands (like `echo` or `cat`).

## 6. Database Migrations & Data Integrity (MANDATORY)
Whenever modifying, creating, or deleting database migrations (`/backend/src/CraftVision.Infrastructure/Migrations`), the agent **MUST** strictly follow these rules to prevent deployment crashes (e.g. on Render):

### 6.1. Foreign Key Hierarchy & Cascade Constraints
- **Check Referencing Tables Before Deleting:** Before writing any migration or SQL script that deletes rows from a parent table (e.g., `products`, `users`, `orders`), ALWAYS check all child tables that hold foreign keys pointing to it.
- **Strict Deletion Order (Child → Parent):**
  - If a foreign key is configured with `ON DELETE RESTRICT` (such as `order_items` referencing `products`), PostgreSQL will reject parent row deletions with error `23503 (foreign_key_violation)`.
  - You MUST delete or disassociate records in child tables FIRST before deleting the parent row:
    - Example hierarchy: `gifts` (child of `order_items`) → `order_items` (child of `products`) → `product_images` → `products`.
  - Never write an isolated `DELETE FROM products WHERE ...` without first cleaning up dependent records in `gifts` and `order_items`.

### 6.2. CI/CD & Cloud Deployment Safety (Render / Docker)
- **Automatic Migration on Startup:** Production and staging environments (e.g., Render) run `db.Database.Migrate()` on container startup. Any failed migration will crash the container with `Exit 139` and take down the service.
- **Local Validation Requirement:**
  - Before pushing migration changes, always test-run `dotnet run --project backend/src/CraftVision.Presentation` locally against a database populated with test data (NOT an empty database) to verify `db.Database.Migrate()` succeeds without constraint violations.
- **Do Not Break Historical Migrations:**
  - If a migration has already been applied in production or merged to `main`, do NOT rewrite history or delete the migration file. Add a new forward migration (`dotnet ef migrations add ...`) instead.
