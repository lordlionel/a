# Replit Project Documentation

## Overview

This is a full-stack canteen management system (SITAB) built to handle consumer management, daily attendance tracking, meal consumption recording, and report generation. The application provides a comprehensive solution for canteen operations with features for tracking who is present each day, recording meal purchases (700F or 1000F options), and generating daily reports in Word document format.

The system is designed to streamline canteen operations by providing an intuitive web interface for staff to manage consumers, mark daily attendance, record meal sales, and generate comprehensive reports for administrative purposes.

## Recent Changes

### August 29, 2025
- ✅ **Date Selection for Consumptions**: Added calendar picker allowing staff to add consumptions for any specific date, not just today
- ✅ **Date Selection for Reports**: Implemented date picker in Reports page enabling viewing statistics and downloading reports for any specific date
- ✅ **Daily Consumption Reset Fix**: Resolved routing conflicts that prevented the "Clear Daily Consumptions" button from working properly
- ✅ **API Route Optimization**: Created dedicated `/api/clear-daily-consumptions` endpoint to avoid conflicts with Vite middleware
- ✅ **Cache Invalidation**: Fixed React Query cache updates ensuring interface reflects data changes immediately
- ✅ **Mobile Responsive Design**: Enhanced mobile experience with proper date selectors and error handling

### September 10, 2025
- ✅ **Netlify Deployment Configuration**: Complete setup for Netlify deployment with serverless functions
- ✅ **Production-Ready Configuration**: Optimized netlify.toml with proper build settings and redirects
- ✅ **Serverless Backend Adaptation**: Converted Express.js backend to Netlify Functions compatibility
- ✅ **CORS and Session Management**: Configured proper headers and session handling for production
- ✅ **Deployment Documentation**: Created comprehensive deployment guide with step-by-step instructions
- ✅ **Environment Setup**: Prepared environment variables configuration for production deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using **React 18** with TypeScript, utilizing a modern component-based architecture:

- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

The application follows a feature-based structure with separate pages for Dashboard, Consumers, Presences, Consumptions, and Reports, each handling specific business logic.

### Backend Architecture
The backend uses **Express.js** with TypeScript in an ESM configuration:

- **API Design**: RESTful API endpoints following resource-based URL patterns
- **Request Handling**: Express middleware for JSON parsing, CORS, and error handling
- **File Processing**: Integration with docx library for Word document generation
- **Logging**: Custom request logging middleware for API monitoring

The server implements a clean separation between routes, storage layer, and business logic, making it maintainable and testable.

### Data Storage Solutions
The application uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations:

- **Database Schema**: Three main entities - consumers, presences, and consumptions
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle-kit for schema management and migrations
- **Relationships**: Properly defined foreign key relationships with cascade deletes

The schema is designed to handle daily operations efficiently with proper indexing on date fields for reporting queries.

### Authentication and Authorization
Currently, the system appears to be designed for internal use without complex authentication mechanisms. The architecture supports session-based authentication preparation through the existing middleware structure.

### Report Generation System
The application includes a sophisticated reporting system:

- **Document Generation**: Uses docx library to create Word documents programmatically
- **Daily Reports**: Generates comprehensive daily consumption reports with totals
- **Export Functionality**: Provides downloadable reports in .docx format
- **Statistical Analysis**: Real-time calculation of daily metrics and revenue

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

### UI and Development Libraries
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

### Build and Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static typing for both frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment integration with error overlays

### Document and Data Processing
- **docx**: Library for generating Microsoft Word documents
- **React Query**: Server state management and caching
- **Wouter**: Lightweight routing for React applications
- **date-fns**: Date manipulation and formatting utilities

### Backend Services
- **Express.js**: Web server framework
- **WebSocket Support**: For Neon database connections
- **CORS Support**: Cross-origin resource sharing configuration