// vite.config.ts
import path from "path";
import { defineConfig } from "file:///Users/edduran/Codelive%20Assistant/node_modules/.pnpm/vite@5.4.4_@types+node@22.5.4/node_modules/vite/dist/node/index.js";
import react from "file:///Users/edduran/Codelive%20Assistant/node_modules/.pnpm/@vitejs+plugin-react-swc@3.7.0_vite@5.4.4_@types+node@22.5.4_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import chokidar from "file:///Users/edduran/Codelive%20Assistant/node_modules/.pnpm/chokidar@4.0.1/node_modules/chokidar/esm/index.js";
var __vite_injected_original_dirname = "/Users/edduran/Codelive Assistant/packages/web";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // reload on backend change
    {
      name: "backend-watch-reload",
      configureServer(server) {
        const watcher = chokidar.watch("../api", {
          persistent: true,
          ignored: (file, stats) => !!stats?.isFile() && !file.endsWith(".mts")
        });
        watcher.on("change", () => {
          server.ws.send({
            type: "full-reload"
          });
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    outDir: "public",
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZWRkdXJhbi9Db2RlbGl2ZSBBc3Npc3RhbnQvcGFja2FnZXMvd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZWRkdXJhbi9Db2RlbGl2ZSBBc3Npc3RhbnQvcGFja2FnZXMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9lZGR1cmFuL0NvZGVsaXZlJTIwQXNzaXN0YW50L3BhY2thZ2VzL3dlYi92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCBjaG9raWRhciBmcm9tICdjaG9raWRhcic7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICAvLyByZWxvYWQgb24gYmFja2VuZCBjaGFuZ2VcbiAgICB7XG4gICAgICBuYW1lOiAnYmFja2VuZC13YXRjaC1yZWxvYWQnLFxuICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgICBjb25zdCB3YXRjaGVyID0gY2hva2lkYXIud2F0Y2goJy4uL2FwaScsIHtcbiAgICAgICAgICBwZXJzaXN0ZW50OiB0cnVlLFxuICAgICAgICAgIGlnbm9yZWQ6IChmaWxlLCBzdGF0cykgPT4gISFzdGF0cz8uaXNGaWxlKCkgJiYgIWZpbGUuZW5kc1dpdGgoJy5tdHMnKSxcbiAgICAgICAgfSk7XG4gICAgICAgIHdhdGNoZXIub24oJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICBzZXJ2ZXIud3Muc2VuZCh7XG4gICAgICAgICAgICB0eXBlOiAnZnVsbC1yZWxvYWQnLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcblxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdwdWJsaWMnLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThULE9BQU8sVUFBVTtBQUMvVSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxjQUFjO0FBSHJCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLElBRU47QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGdCQUFnQixRQUFRO0FBQ3RCLGNBQU0sVUFBVSxTQUFTLE1BQU0sVUFBVTtBQUFBLFVBQ3ZDLFlBQVk7QUFBQSxVQUNaLFNBQVMsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxDQUFDLE9BQU8sT0FBTyxLQUFLLENBQUMsS0FBSyxTQUFTLE1BQU07QUFBQSxRQUN0RSxDQUFDO0FBQ0QsZ0JBQVEsR0FBRyxVQUFVLE1BQU07QUFDekIsaUJBQU8sR0FBRyxLQUFLO0FBQUEsWUFDYixNQUFNO0FBQUEsVUFDUixDQUFDO0FBQUEsUUFDSCxDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
