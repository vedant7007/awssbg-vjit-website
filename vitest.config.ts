import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));
const serverOnlyStub = fileURLToPath(
  new URL("./test/stubs/server-only.ts", import.meta.url),
);

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // The ticket signer reads TICKET_SECRET at call time; give tests a valid one.
    env: {
      TICKET_SECRET: "test-secret-that-is-long-enough-for-hmac",
    },
  },
  resolve: {
    alias: [
      // Map the `@/…` path alias to ./src (regex so it never matches @scoped deps).
      { find: /^@\/(.*)$/, replacement: `${src}/$1` },
      // Neutralize the `server-only` guard in the Node test runner.
      { find: "server-only", replacement: serverOnlyStub },
    ],
  },
});
