import { javascript } from "projen";
import { monorepo } from "@aws/pdk";
const project = new monorepo.MonorepoTsProject({
  devDeps: ["@aws/pdk"],
  name: "dev-ec2",
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
});
project.synth();