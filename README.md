# Social Blogging Platform

A modern social blogging platform built with React Native and Expo, allowing users to create, share, and interact with blog posts.

## Features

- User authentication (login/register)
- Blog post creation and management
- Profile management
- Modern and responsive UI
- Cross-platform support (iOS, Android)

## Tech Stack

- React Native
- Expo
- TypeScript
- React Query (TanStack Query)
- AsyncStorage
- React Native Toast Message

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Studio (for Android development)

## Getting Started

1. Clone the repository:

   ```
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:

   ```
   cd frontend
   npm install
   ```

   and

   ```
   cd backend
   npm install
   ```

3. Start the frontend:

   ```
   cd frontend
   npm start
   ```

4. Run the app:

   - Press `i` to open in iOS simulator
   - Press `a` to open in Android emulator
   - Scan the QR code with Expo Go app on your physical device

5. Start the backend

   - First create a .env file and add your postgres config other values there
   - Then run the db initialization file from sql/init.sql
   - Then start the server with

```
cd backend
npm run build
npm start
```

or in development mode

```
cd backend
npm run dev
```
