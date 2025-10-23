# Replit Project Documentation

## Overview

This is a full-stack canteen management system (SITAB) built to handle consumer management, daily attendance tracking, meal consumption recording, and report generation. The application provides a comprehensive solution for canteen operations with features for tracking who is present each day, recording meal purchases (700F or 1000F options), and generating daily reports in Word document format.

The system is designed to streamline canteen operations by providing an intuitive web interface for staff to manage consumers, mark daily attendance, record meal sales, and generate comprehensive reports for administrative purposes.

## Recent Changes

### October 23, 2025
- ✅ **Android Mobile Application**: Complete conversion to offline-first Android mobile app using Capacitor
- ✅ **SQLite Local Database**: Implemented SQLite database with schema mirroring PostgreSQL structure
- ✅ **Adaptive API Layer**: Created automatic platform detection switching between web (HTTP) and mobile (SQLite)
- ✅ **Offline-First Architecture**: Full CRUD operations work without internet connection on mobile
- ✅ **Mobile Report Generation**: Integrated Capacitor Filesystem + Share for Word document generation on mobile
- ✅ **Data Export System**: Created PostgreSQL to JSON export script for mobile seed data
- ✅ **Presence Toggle Fix**: Corrected mobile presence handling to support isPresent column and proper toggling
- ✅ **Platform Detection**: Automatic fallback to web mode when not running on Capacitor
- ✅ **Build Automation**: GitHub Actions workflow and preparation scripts for Android APK generation
- ✅ **Comprehensive Documentation**: Created complete mobile deployment guide (GUIDE_APPLICATION_MOBILE_ANDROID.md)

### September 10, 2025
- ✅ **Netlify Deployment Configuration**: Complete setup for Netlify deployment with serverless functions
- ✅ **Production-Ready Configuration**: Optimized netlify.toml with proper build settings and redirects
- ✅ **Serverless Backend Adaptation**: Converted Express.js backend to Netlify Functions compatibility
- ✅ **CORS and Session Management**: Configured proper headers and session handling for production
- ✅ **Deployment Documentation**: Created comprehensive deployment guide with step-by-step instructions
- ✅ **Environment Setup**: Prepared environment variables configuration for production deployment

### August 29, 2025
- ✅ **Date Selection for Consumptions**: Added calendar picker allowing staff to add consumptions for any specific date, not just today
- ✅ **Date Selection for Reports**: Implemented date picker in Reports page enabling viewing statistics and downloading reports for any specific date
- ✅ **Daily Consumption Reset Fix**: Resolved routing conflicts that prevented the "Clear Daily Consumptions" button from working properly
- ✅ **API Route Optimization**: Created dedicated `/api/clear-daily-consumptions` endpoint to avoid conflicts with Vite middleware
- ✅ **Cache Invalidation**: Fixed React Query cache updates ensuring interface reflects data changes immediately
- ✅ **Mobile Responsive Design**: Enhanced mobile experience with proper date selectors and error handling

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Multi-Platform Architecture
SITAB is now a **dual-platform application** supporting both web and mobile Android:

- **Web Platform**: Traditional browser-based application using HTTP/REST API with PostgreSQL backend
- **Mobile Platform**: Native Android app with offline-first architecture using SQLite local storage
- **Adaptive Layer**: Automatic platform detection switches data sources transparently based on runtime environment

### Frontend Architecture
The frontend is built using **React 18** with TypeScript, utilizing a modern component-based architecture:

- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds
- **Mobile Framework**: Capacitor for native Android compilation and APIs

The application follows a feature-based structure with separate pages for Dashboard, Consumers, Presences, Consumptions, and Reports, each handling specific business logic.

### Backend Architecture
The backend uses **Express.js** with TypeScript in an ESM configuration:

- **API Design**: RESTful API endpoints following resource-based URL patterns
- **Request Handling**: Express middleware for JSON parsing, CORS, and error handling
- **File Processing**: Integration with docx library for Word document generation
- **Logging**: Custom request logging middleware for API monitoring

The server implements a clean separation between routes, storage layer, and business logic, making it maintainable and testable.

### Data Storage Solutions
The application uses a **dual-database architecture** depending on the platform:

**Web Mode (PostgreSQL):**
- **Primary Database**: Neon serverless PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle-kit for schema management
- **Schema**: Three main entities - consumers, presences, and consumptions

**Mobile Mode (SQLite):**
- **Local Database**: SQLite using @capacitor-community/sqlite plugin
- **Storage Layer**: Custom mobile-storage.ts implementing same interface as PostgreSQL
- **Schema Mirror**: Identical schema structure to ensure data consistency
- **Offline-First**: All CRUD operations work without internet connection
- **Data Seeding**: Imports from seed-data.json on first launch

**Adaptive API:**
- **Platform Detection**: client/src/lib/platform.ts detects Capacitor runtime
- **API Abstraction**: client/src/services/api.ts automatically routes to appropriate backend
- **Transparent Switching**: Components use same API regardless of platform

The schema is designed to handle daily operations efficiently with proper indexing on date fields for reporting queries.

### Authentication and Authorization
Currently, the system appears to be designed for internal use without complex authentication mechanisms. The architecture supports session-based authentication preparation through the existing middleware structure.

### Report Generation System
The application includes a sophisticated reporting system with platform-specific implementations:

**Web Platform:**
- **Document Generation**: Uses docx library to create Word documents programmatically on server
- **Download**: Browser-based file download via Blob URLs

**Mobile Platform:**
- **Local Generation**: Creates Word documents client-side using docx library
- **File Storage**: Saves to device using Capacitor Filesystem API
- **Sharing**: Native share dialog via Capacitor Share API for distribution

**Common Features:**
- **Daily Reports**: Generates comprehensive daily consumption reports with totals
- **Export Functionality**: Provides downloadable/shareable reports in .docx format
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
- **Capacitor**: Native mobile app compilation framework
- **Android SDK**: Required for Android APK generation (local build or GitHub Actions)
- **GitHub Actions**: Automated CI/CD workflow for Android builds (.github/workflows/android-build.yml)

### Document and Data Processing
- **docx**: Library for generating Microsoft Word documents
- **React Query**: Server state management and caching
- **Wouter**: Lightweight routing for React applications
- **date-fns**: Date manipulation and formatting utilities

### Backend Services
- **Express.js**: Web server framework (web mode only)
- **WebSocket Support**: For Neon database connections (web mode)
- **CORS Support**: Cross-origin resource sharing configuration (web mode)
- **SQLite**: Embedded database for mobile offline storage
- **Capacitor Plugins**: Native device APIs (Filesystem, Share, SQLite)