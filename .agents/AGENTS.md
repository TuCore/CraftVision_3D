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
