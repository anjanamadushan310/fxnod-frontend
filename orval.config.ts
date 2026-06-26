import { defineConfig } from "orval";

/**
 * Orval — generates React Query hooks + Axios calls + TS models from the
 * backend OpenAPI spec.
 *
 * Public surface only: operations tagged `Internal` (service-to-service +
 * admin) are excluded natively via input.filters, so the frontend client
 * never references them.
 *
 * Output structure (frontend/src/services/api/):
 *   endpoints/<tag>/<tag>.ts   generated hooks, one folder per tag
 *   model/                     generated TS models (schemas)
 *   mutator/custom-instance.ts hand-written Axios instance (NOT generated)
 *
 * Run: npm run gen:api
 */
export default defineConfig({
  fxnod: {
    input: {
      target: "../backend/openapi.yaml",
      // Native tag exclusion — only public-facing hooks are generated.
      filters: {
        tags: ["Internal"],
        mode: "exclude",
      },
    },
    output: {
      mode: "tags-split",
      target: "src/services/api/endpoints",
      schemas: "src/services/api/model",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      override: {
        // Route every request through our Axios instance (baseURL, cookies,
        // auth-refresh interceptor live there).
        mutator: {
          path: "src/services/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useMutation: true,
          // Matches the installed @tanstack/react-query v5.
          version: 5,
        },
      },
    },
  },
});
