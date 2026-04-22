import { config } from "dotenv";
config({ path: "../../.env" });

import "@my-better-t-app/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: {
    compilationMode: "infer",
  },
};

export default nextConfig;
