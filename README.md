# GEA Content Management System

Content Management System for managing advertisements, news articles, and user data.

## Backend URL

The backend API is hosted at: `https://cms-api.devbygian.com`

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Tech Stack](#tech-stack)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **bun** package manager
- **Git** (for version control)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fe-cms
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Add necessary environment variables:
     ```
     VITE_API_URL=your_api_endpoint
     ```

## Running the Server

### Development Mode

To start the development server with hot module replacement (HMR):

```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173` (default Vite port)

### Production Build

To build the application for production:

```bash
npm run build
```

This will compile TypeScript and bundle the application into the `dist` folder.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

### Linting

To check code quality and style:

```bash
npm run lint
```

## Project Structure

```
fe-cms/
├── public/                      # Static assets served directly
│   ├── animation/              # Animation files (e.g., Lottie animations)
│   └── logo/                   # Logo assets
│
├── src/                        # Source code directory
│   ├── assets/                 # Static assets (images, fonts, etc.)
│   │
│   ├── components/             # React components
│   │   ├── ads/               # Advertisement management components
│   │   │   ├── AdsCard.tsx           # Display ad card
│   │   │   ├── AdsEditForm.tsx       # Edit advertisement form
│   │   │   ├── AdsForm.tsx           # Create advertisement form
│   │   │   ├── AdsImage.tsx          # Ad image display
│   │   │   └── AdsImageUploader.tsx  # Ad image upload component
│   │   │
│   │   ├── news/              # News management components
│   │   │   ├── NewsCard.tsx          # Display news card
│   │   │   ├── NewsEditForm.tsx      # Edit news form
│   │   │   ├── NewsForm.tsx          # Create news form
│   │   │   ├── NewsImage.tsx         # News image display
│   │   │   └── NewsImageUploader.tsx # News image upload component
│   │   │
│   │   ├── rich-text-editor/ # Rich text editor components
│   │   │   ├── MenuBar.tsx           # Editor menu bar
│   │   │   ├── RichTextImageUploader.tsx # Image uploader for editor
│   │   │   ├── Table.tsx             # Table component for editor
│   │   │   └── Tiptap.tsx            # Main Tiptap editor wrapper
│   │   │
│   │   ├── ui/                # Reusable UI components (shadcn/ui)
│   │   │   ├── avatar.tsx            # Avatar component
│   │   │   ├── badge.tsx             # Badge component
│   │   │   ├── breadcrumb.tsx        # Breadcrumb navigation
│   │   │   ├── button.tsx            # Button component
│   │   │   ├── calendar.tsx          # Calendar component
│   │   │   ├── card.tsx              # Card component
│   │   │   ├── chart.tsx             # Chart component
│   │   │   ├── ...Other UI components (checkbox, dialog, dropdown, etc.)
│   │   │
│   │   ├── AdsCategoryDistribution.tsx # Ads analytics component
│   │   ├── AdsList.tsx                 # Ads listing component
│   │   ├── AppSidebar.tsx              # Main application sidebar
│   │   ├── Loader.tsx                  # Loading spinner component
│   │   ├── LoginForm.tsx               # Login form component
│   │   ├── Navbar.tsx                  # Navigation bar component
│   │   ├── NewsCategoryDistribution.tsx # News analytics component
│   │   ├── NewsList.tsx                # News listing component
│   │   ├── PasswordInput.tsx           # Password input with visibility toggle
│   │   ├── RegisterForm.tsx            # Registration form component
│   │   └── RequiredLabel.tsx           # Required field label
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-api.ts                # API interaction hook
│   │   ├── use-auth.ts               # Authentication hook
│   │   ├── use-debounce.ts           # Debounce hook
│   │   ├── use-mobile.ts             # Mobile detection hook
│   │   └── use-title.ts              # Document title hook
│   │
│   ├── lib/                    # Library utilities
│   │   └── utils.ts                  # Utility functions (cn, clsx, etc.)
│   │
│   ├── pages/                  # Page components (route-based)
│   │   ├── _app.tsx                  # Root app component
│   │   ├── 404.tsx                   # 404 error page
│   │   ├── index.tsx                 # Home page
│   │   │
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── _layout.tsx           # Auth layout wrapper
│   │   │   ├── login.tsx             # Login page
│   │   │   └── register.tsx          # Registration page
│   │   │
│   │   └── dashboard/                # Dashboard pages
│   │       ├── _layout.tsx           # Dashboard layout wrapper
│   │       ├── index.tsx             # Dashboard home page
│   │       │
│   │       ├── ads/                  # Advertisement management pages
│   │       │   ├── index.tsx         # Ads listing page
│   │       │   └── [id].tsx          # Ad detail/edit page (dynamic route)
│   │       │
│   │       ├── news/                 # News management pages
│   │       │   ├── index.tsx         # News listing page
│   │       │   └── [id].tsx          # News detail/edit page (dynamic route)
│   │       │
│   │       └── users/                # User management pages
│   │           ├── _columns.tsx      # Table column definitions
│   │           ├── _data-table.tsx   # Reusable data table component
│   │           └── index.tsx         # Users listing page
│   │
│   ├── providers/              # React context providers
│   │   ├── auth-providers.tsx        # Authentication context
│   │   └── theme-provider.tsx        # Theme/dark mode context
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── ads.type.ts               # Advertisement types
│   │   ├── index.ts                  # Barrel export
│   │   ├── news.types.ts             # News types
│   │   └── user.types.ts             # User types
│   │
│   ├── utils/                  # Utility functions
│   │   ├── enum-format.ts            # Enum formatting helpers
│   │   └── image-handler.ts          # Image handling utilities
│   │
│   ├── App.css                 # Main app styles
│   ├── index.css               # Global styles
│   ├── main.tsx                # Application entry point
│   ├── router.ts               # Router configuration
│   └── vite-env.d.ts           # Vite environment types
│
├── components.json             # shadcn/ui configuration
├── docker-compose.yml          # Docker compose configuration
├── Dockerfile                  # Docker image configuration
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # TypeScript app configuration
├── tsconfig.node.json          # TypeScript node configuration
└── vite.config.ts              # Vite configuration
```

### Directory Explanations

#### `/public`

Static assets served directly without processing. These files are copied as-is to the build output.

#### `/src/components`

Modular React components organized by feature:

- **ads/** - Components for managing advertisements and promotions
- **news/** - News article management and display
- **rich-text-editor/** - WYSIWYG editor for content creation using Tiptap
- **ui/** - Reusable UI primitives from shadcn/ui library

#### `/src/hooks`

Custom React hooks for common functionality:

- **use-api.ts** - Simplifies API calls with error handling and request management
- **use-auth.ts** - Authentication state and user session management
- **use-debounce.ts** - Debounce values to optimize performance (e.g., search inputs)
- **use-mobile.ts** - Responsive design utilities for mobile detection
- **use-title.ts** - Dynamic document title management

#### `/src/pages`

File-based routing structure using @generouted/react-router. Each file/folder represents a route in the application.

**Authentication Routes:**

- **`(auth)/`** - Authentication pages group
  - `_layout.tsx` - Shared layout for auth pages
  - `login.tsx` - Login page (route: `/login`)
  - `register.tsx` - Registration page (route: `/register`)

**Dashboard Routes:**

The dashboard is the main administrative interface, organized into several management sections:

- **`_layout.tsx`** - Shared layout for all dashboard pages (includes sidebar, navigation)
- **`index.tsx`** - Dashboard homepage with analytics and overview

- **`ads/`** - Advertisement Management

  - `index.tsx` - View all advertisements in a list with category distribution
  - `[id].tsx` - Edit or view individual advertisement details (route: `/dashboard/ads/{id}`)

- **`news/`** - News Article Management

  - `index.tsx` - Browse all news articles with category distribution
  - `[id].tsx` - Edit or view individual news article (route: `/dashboard/news/{id}`)

- **`users/`** - User Management
  - `index.tsx` - View and manage all registered users
  - `_columns.tsx` - Table column configuration for user data
  - `_data-table.tsx` - Reusable data table component with sorting and filtering

**Note:** Files prefixed with underscore (`_`) are not routable pages but shared components/utilities used within that section.

#### `/src/providers`

React Context providers for global state management:

- **auth-providers.tsx** - User authentication state, login/logout functionality
- **theme-provider.tsx** - Dark/light theme toggling support

#### `/src/types`

TypeScript type definitions and interfaces for type safety across the application.

#### `/src/utils`

Utility functions and helper methods used throughout the app.

## Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start development server with HMR  |
| `npm run build`   | Build for production               |
| `npm run preview` | Preview production build locally   |
| `npm run lint`    | Run ESLint for code quality checks |

## Tech Stack

### Core

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server

### Routing

- **@generouted/react-router** - File-based routing with React Router
- **React Router v7** - Client-side routing

### UI Components

- **Radix UI** - Unstyled, accessible component primitives
- **shadcn/ui** - Re-usable component library built on Radix UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Forms & Validation

- **React Hook Form** - Performant form state management
- **@hookform/resolvers** - Form validation resolvers
- **Zod** - TypeScript-first schema validation

### Rich Text Editor

- **Tiptap** - Headless rich text editor framework
- **@tiptap/starter-kit** - Essential editor extensions
- **@tiptap/extensions** - Additional editor functionality (tables, images, text alignment)

### Data Fetching & State

- **Axios** - HTTP client for API requests
- **SWR** - React hooks for data fetching with caching
- **@tanstack/react-table** - Powerful table state management

### UI Libraries

- **Recharts** - Charting library for data visualization
- **date-fns** - Modern date utility library
- **sonner** - Toast notifications
- **next-themes** - Theme management system

### Additional Features

- **React Dropzone** - Drag-and-drop file uploads
- **React Cookie** - Cookie management
- **isomorphic-dompurify** - XSS sanitization for HTML content
- **class-variance-authority** - Type-safe component variants
- **clsx** / **tailwind-merge** - Utility for conditional CSS classes

### Development Tools

- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript v5.8** - Static type checking
- **Docker** - Containerization support

---

## Docker Deployment

The project includes Docker support for containerized deployment:

```bash
# Build the Docker image
docker build -t fe-cms .

# Run the container
docker run -p 80:80 fe-cms

# Or use docker-compose
docker-compose up
```

The Dockerfile uses a multi-stage build process:

1. Dependencies installed using Bun runtime
2. Application compiled with Vite
3. Static files served using Nginx with optimized caching and security headers
