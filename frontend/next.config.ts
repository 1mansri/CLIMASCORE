import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: TypeScript 7.0.2 (the native/"Corsa" compiler) was tried first per the
  // project brief, with experimental.useTypeScriptCli enabled, and `next build`
  // passed cleanly under it. It was reverted to typescript@6.0.3 (the latest
  // stable release of the classic/JS compiler line) only because
  // typescript-eslint does not yet support the TS 7 API (tracked upstream:
  // https://github.com/typescript-eslint/typescript-eslint/issues/10940), which
  // made `pnpm lint` hard-crash. This is a documented deviation, not a silent
  // downgrade — see the final report.
};

export default nextConfig;
