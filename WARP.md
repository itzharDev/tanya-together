# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a multi-platform Torah study application ("Tanya") with two codebases:
1. **Flutter Mobile App** (root): Cross-platform mobile and desktop app for iOS, Android, macOS, Linux, and Windows
2. **React Web App** (tanya-web/): Web-based version using Vite + React

Both applications share the same backend (Parse Server) and Firebase services, providing synchronized study groups and reading sessions.

## Common Commands

### Flutter Mobile App (Root Directory)

**Development**
```bash
# Run on connected device/simulator
flutter run

# Run on specific device
flutter devices  # List available devices
flutter run -d <device-id>

# Hot reload is automatic during development (press 'r' in terminal)
# Hot restart: press 'R' in terminal
```

**Building**
```bash
# Build for Android
flutter build apk
flutter build appbundle  # For Play Store

# Build for iOS (requires macOS)
flutter build ios

# Build for web
flutter build web

# Build for desktop
flutter build macos
flutter build linux
flutter build windows
```

**Testing & Quality**
```bash
# Run tests
flutter test

# Run tests with coverage
flutter test --coverage

# Static analysis
flutter analyze

# Get dependencies
flutter pub get

# Update dependencies
flutter pub upgrade
```

**Asset Generation**
```bash
# Generate asset reference classes (custom script)
./generate_assets.sh
```

### React Web App (tanya-web/)

**Development**
```bash
cd tanya-web

# Start dev server (usually on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

**Dependencies**
```bash
cd tanya-web
npm install
```

## Architecture

### Flutter App Architecture

The Flutter app uses a **feature-based architecture** with BLoC/Cubit pattern for state management:

**Core Structure:**
- `lib/main.dart` - App entry point, initializes Firebase and Parse Server
- `lib/core/` - Shared utilities and infrastructure
  - `ioc.dart` - Dependency injection using GetIt (singleton pattern)
  - `size_config.dart` - Responsive sizing utility
  - `cubit/` - Global state management (navigator, loading, socket.io)
  - `consts/` - Constants and asset references

**Feature Modules:** Each feature follows a vertical slice architecture:
- `lib/auth/` - Authentication feature
  - `presentation/` - Login UI and auth cubit
- `lib/feed/` - Main reading/study groups feature
  - `cubit/` - Feed state management
  - `presentation/` - Feed UI and reader view
  - `group.dart` - Group data model

**Key Technologies:**
- State Management: `flutter_bloc` with Cubit pattern
- Dependency Injection: `get_it` (see `locator` in `ioc.dart`)
- Backend: Parse Server SDK + Firebase (auth, analytics, messaging, realtime database)
- Real-time: `socket_io_client` for live updates
- UI: Material Design 3 with RTL (Right-to-Left) support for Hebrew

**Important Patterns:**
- All features use Cubit for state management (accessed via `locator.get<CubitName>()`)
- The app supports both mobile and desktop layouts (see `isDesktop()` in `main.dart`)
- RTL is enforced at the root level with `Directionality(textDirection: TextDirection.rtl)`
- Global loading overlay managed by `LoadingCubit` and `LoadingScreen.init()`

### React Web App Architecture

The React web app uses modern React patterns with context-based state management:

**Structure:**
- `src/main.jsx` - App entry point
- `src/App.jsx` - Router setup with private routes
- `src/pages/` - Route components (Login, Feed, Reader)
- `src/components/` - Reusable UI components
- `src/context/` - React Context providers
  - `AuthContext.jsx` - Authentication state
  - `SocketContext.jsx` - Socket.io connection
- `src/services/` - API services
- `src/utils/` - Utility functions (including Hebrew text helpers)
- `src/axios.js` - Axios HTTP client configuration

**Key Technologies:**
- Build Tool: Vite
- Routing: `react-router-dom` v7
- Styling: Tailwind CSS v4
- State Management: React Context API
- Backend: Parse Server + Firebase
- Real-time: `socket.io-client`

**Authentication Flow:**
- `AuthContext` wraps the app and provides authentication state
- `PrivateRoute` component protects authenticated routes
- Socket connection established after authentication via `SocketProvider`

## Backend Configuration

Both apps connect to:
- **Parse Server**: `https://tanya.dvarmalchus.co.il/parse` (Application ID: `480c8e46-1901-44ab-9b6c-b00d0e3c3416`)
- **Firebase**: Configured via `firebase_options.dart` (Flutter) and Firebase SDK (React)

## Important Notes

- **RTL Layout**: The app is designed for Hebrew text with right-to-left layout
- **Multi-platform**: Flutter app supports mobile (iOS, Android) and desktop (macOS, Windows, Linux), plus web
- **Shared Backend**: Both Flutter and React apps use the same Parse Server and Firebase instance
- **State Management**: Flutter uses Cubit pattern; React uses Context API
- **Real-time Features**: Both apps use Socket.io for live updates in reading groups
- **Anonymous Access**: 
  - Anonymous users can browse all public groups
  - Anonymous users can read any part and mark parts as finished
  - Authentication is ONLY required for creating new groups
  - Progress tracking:
    - When a user opens a part to read, it's added to `inProgress` array (both authenticated and anonymous)
    - When finished reading, it moves from `inProgress` to `book` array
    - If user leaves without finishing, it's automatically removed from `inProgress`
