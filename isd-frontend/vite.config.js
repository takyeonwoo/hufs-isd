import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // .env 는 모노레포 루트(hufs-isd/.env)에 둔다 — 프론트/백 공용 위치.
  envDir: "..",
});
