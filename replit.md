# DeployP2V - AI Solutions for Small Business

## Overview

DeployP2V is a full-stack web application for an AI consulting company targeting small businesses in Texas. The platform provides information about AI services, allows potential clients to submit contact inquiries, subscribe to newsletters, and includes an admin dashboard for managing leads and file uploads. The application features an AI-powered chatbot widget for visitor engagement and lead qualification.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

The frontend follows a pages-based structure with reusable components. Pages include home, admin, blog, case studies, FAQ, ROI calculator, resources, and legal pages.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints under `/api` prefix
- **File Handling**: Multer for multipart form uploads stored in `/uploads` directory

The server provides endpoints for contact form submissions, newsletter subscriptions, file management, and admin authentication using a simple password-based system.

### Data Storage
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, contacts, newsletters, files

The database schema uses Drizzle with Zod for validation. Insert schemas are generated from table definitions for type-safe form handling.

### Authentication
- **Admin Access**: Simple password-based authentication (hardcoded password in routes)
- **No User Sessions**: The application does not implement session management or user registration

### Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **API Layer**: Centralized `apiRequest` function for consistent fetch handling
- **Component Library**: shadcn/ui components with consistent styling via CVA (class-variance-authority)

## External Dependencies

### Database
- **Neon Database** (`@neondatabase/serverless`): Serverless PostgreSQL with WebSocket support
- **Drizzle ORM** (`drizzle-orm`, `drizzle-kit`): Type-safe database operations and migrations

### AI Integration
- **Anthropic SDK** (`@anthropic-ai/sdk`): Claude AI integration for chatbot functionality

### Email Services
- **SendGrid** (`@sendgrid/mail`): Email delivery for contact form notifications and newsletters

### UI Framework
- **Radix UI**: Unstyled, accessible component primitives (accordion, dialog, dropdown, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Form Handling
- **React Hook Form** with **Zod** resolvers for form validation
- **Drizzle-Zod**: Generate Zod schemas from Drizzle tables

### File Upload
- **Multer**: Multipart form data handling for file uploads
- Allowed types: PDF, images, Office documents, text files (20MB limit)

### Development Tools
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development