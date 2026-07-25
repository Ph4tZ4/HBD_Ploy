import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // เปิดรับการเข้าถึงจากเครื่องอื่นในเครือข่ายเดียวกัน (LAN / Wi-Fi)
  },
})
