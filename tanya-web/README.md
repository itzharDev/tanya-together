# Tanya Web - תניא המחולק

A React web application for collaborative Torah study, converted from the Flutter mobile app.

## Features

- 📖 **Collaborative Reading**: Join reading groups and complete books together
- 👤 **Anonymous Access**: Read and contribute without logging in
- 🎯 **Smart Part Selection**: Automatically get random unread parts
- 🔄 **Real-time Updates**: Socket.io for live progress tracking
- 🌐 **Social Sharing**: Open Graph meta tags for sharing on social media
- 🇮🇱 **Hebrew RTL Support**: Fully localized with right-to-left layout
- 📱 **Responsive Design**: Works on mobile and desktop

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Authentication

**Anonymous users can:**
- Browse all public groups
- Read any book part
- Mark parts as finished

**Login required only for:**
- Creating new reading groups

See [AUTH_REQUIREMENTS.md](./AUTH_REQUIREMENTS.md) for detailed information.

## Tech Stack

- **Framework**: React 19 + Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **Backend**: Parse Server + Firebase
- **Real-time**: Socket.io
- **State Management**: React Context API

## Project Structure

```
src/
├── pages/          # Route components (Login, Feed, Reader/Group)
├── components/     # Reusable components (GroupCard, CreateGroupModal)
├── context/        # React Context providers (Auth, Socket)
├── services/       # API services (Parse, Firebase)
├── utils/          # Utility functions (Hebrew text helpers)
└── assets/         # Images and icons
```

## Environment Variables

Configure Firebase and Parse Server in:
- `src/services/firebase.js`
- `src/services/parse.js`

## License

Private - All rights reserved
