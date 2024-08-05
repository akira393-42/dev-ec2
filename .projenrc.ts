import { javascript } from "projen";
import { monorepo } from "@aws/pdk";
import { InfrastructureTsProject } from "@aws/pdk/infrastructure";
const project = new monorepo.MonorepoTsProject({
  devDeps: ["@aws/pdk"],
  name: "dev-ec2",
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  eslint: true,
  licensed: false,
  licenseOptions: {
    disableDefaultLicenses: true,
  },
});



const stackNames = [{ name: "ec2-dev-environment", },
];
stackNames.forEach((stack) => {
  new InfrastructureTsProject({
    parent: project,
    outdir: "packages/" + stack.name,
    name: stack.name,
    stackName: `${stack.name}-stack`,
    cdkVersion: "2.147.1",
  });
});

project.vscode?.settings.addSetting("editor.codeActionsOnSave", {
  "source.fixAll.eslint": "explicit",
});

const recommendExtentions = [
  "adam-bender.commit-message-editor",
  "mhutchie.git-graph",
  "donjayamanne.githistory",
  "eamodio.gitlens",
  "MarkMcCulloh.vscode-projen",
  "dbaeumer.vscode-eslint",
  "amazonwebservices.aws-toolkit-vscode",
  "adam-bender.commit-message-editor",
];
recommendExtentions.forEach((ext) => {
  project.vscode?.extensions.addRecommendations(ext);
});

project.synth();