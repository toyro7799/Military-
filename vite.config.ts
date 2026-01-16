import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // تحميل متغيرات البيئة
    const env = loadEnv(mode, '.', '');

    // المفتاح الخاص بك
    const MY_API_KEY = "AIzaSyCEK9hz7eCkbxfv9RlQKYrfekfYxy7oX0s";

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // تم ربط المفتاح هنا ليصبح متاحاً في ملفات الـ React
        'process.env.API_KEY': JSON.stringify(MY_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(MY_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
