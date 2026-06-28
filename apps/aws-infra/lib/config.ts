import appConfig from "../app-config.json";

type StageConfig = (typeof appConfig.stages)[number];

export function getStageConfig(stageName: string): StageConfig {
  const stage = appConfig.stages.find((s) => s.name === stageName);
  if (!stage) {
    throw new Error(`Stage "${stageName}" not found in app-config.json`);
  }
  return stage;
}
