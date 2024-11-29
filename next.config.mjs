/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyAuqpvJle3Ub7_5hmUKqOqKEfZ1qKMYwIY',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'ibb-app-web-dev.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'ibb-app-web-dev',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'ibb-app-web-dev.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '1089908176172',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:1089908176172:web:22f6fe61c47c3de1cee889',
    // ENV: 'local',
    ENV: 'production',
    URL_BACKEND_LOCAL: 'http://localhost:3001',
    URL_BACKEND_DEV: 'https://api.ibbrooklin.org.br',
    URL_BACKEND_PROD: 'https://api.ibbrooklin.org.br',
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
