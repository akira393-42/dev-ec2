import { CdkGraph, FilterPreset, Filters } from "@aws/pdk/cdk-graph";
import { CdkGraphDiagramPlugin } from "@aws/pdk/cdk-graph-plugin-diagram";
import { CdkGraphThreatComposerPlugin } from "@aws/pdk/cdk-graph-plugin-threat-composer";
import { AwsPrototypingChecks, PDKNag } from "@aws/pdk/pdk-nag";
import { ApplicationStack } from "./stacks/application-stack";

/* eslint-disable @typescript-eslint/no-floating-promises */
(async () => {
  const app = PDKNag.app({
    nagPacks: [new AwsPrototypingChecks()],
  });


  // Use this to deploy your own sandbox environment (assumes your CLI credentials)
  new ApplicationStack(app, "ec2-dev-environment-stack", {
    userName: 'katsuyama',
    keyPairName: '2024-katsuyama',
  });

  const graph = new CdkGraph(app, {
    plugins: [
      new CdkGraphDiagramPlugin({
        defaults: {
          filterPlan: {
            preset: FilterPreset.COMPACT,
            filters: [{ store: Filters.pruneCustomResources() }],
          },
        },
      }),
      new CdkGraphThreatComposerPlugin(),
    ],
  });

  app.synth();
  await graph.report();
})();
