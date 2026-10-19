
/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = {
  apps: [
    {
      name: "InstaMation",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "InstaMation-Worker",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "worker/dm-worker.ts",
      cwd: __dirname,
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
