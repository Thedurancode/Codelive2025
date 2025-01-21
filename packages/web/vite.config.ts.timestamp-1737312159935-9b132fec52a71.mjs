// vite.config.ts
import path from "path";
import { defineConfig } from "file:///Users/edduran/Downloads/srcbook-main-6/node_modules/.pnpm/vite@5.4.4_@types+node@22.5.4/node_modules/vite/dist/node/index.js";
import react from "file:///Users/edduran/Downloads/srcbook-main-6/node_modules/.pnpm/@vitejs+plugin-react-swc@3.7.0_vite@5.4.4_@types+node@22.5.4_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import chokidar from "file:///Users/edduran/Downloads/srcbook-main-6/node_modules/.pnpm/chokidar@4.0.1/node_modules/chokidar/esm/index.js";
var __vite_injected_original_dirname = "/Users/edduran/Downloads/srcbook-main-6/packages/web";
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
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZWRkdXJhbi9Eb3dubG9hZHMvc3JjYm9vay1tYWluLTYvcGFja2FnZXMvd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZWRkdXJhbi9Eb3dubG9hZHMvc3JjYm9vay1tYWluLTYvcGFja2FnZXMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9lZGR1cmFuL0Rvd25sb2Fkcy9zcmNib29rLW1haW4tNi9wYWNrYWdlcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3Yyc7XG5pbXBvcnQgY2hva2lkYXIgZnJvbSAnY2hva2lkYXInO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gcmVsb2FkIG9uIGJhY2tlbmQgY2hhbmdlXG4gICAge1xuICAgICAgbmFtZTogJ2JhY2tlbmQtd2F0Y2gtcmVsb2FkJyxcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hlciA9IGNob2tpZGFyLndhdGNoKCcuLi9hcGknLCB7XG4gICAgICAgICAgcGVyc2lzdGVudDogdHJ1ZSxcbiAgICAgICAgICBpZ25vcmVkOiAoZmlsZSwgc3RhdHMpID0+ICEhc3RhdHM/LmlzRmlsZSgpICYmICFmaWxlLmVuZHNXaXRoKCcubXRzJyksXG4gICAgICAgIH0pO1xuICAgICAgICB3YXRjaGVyLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgc2VydmVyLndzLnNlbmQoe1xuICAgICAgICAgICAgdHlwZTogJ2Z1bGwtcmVsb2FkJyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0sXG4gIF0sXG5cbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFUsT0FBTyxVQUFVO0FBQy9WLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixPQUFPLGNBQWM7QUFIckIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsSUFFTjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLFFBQVE7QUFDdEIsY0FBTSxVQUFVLFNBQVMsTUFBTSxVQUFVO0FBQUEsVUFDdkMsWUFBWTtBQUFBLFVBQ1osU0FBUyxDQUFDLE1BQU0sVUFBVSxDQUFDLENBQUMsT0FBTyxPQUFPLEtBQUssQ0FBQyxLQUFLLFNBQVMsTUFBTTtBQUFBLFFBQ3RFLENBQUM7QUFDRCxnQkFBUSxHQUFHLFVBQVUsTUFBTTtBQUN6QixpQkFBTyxHQUFHLEtBQUs7QUFBQSxZQUNiLE1BQU07QUFBQSxVQUNSLENBQUM7QUFBQSxRQUNILENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
