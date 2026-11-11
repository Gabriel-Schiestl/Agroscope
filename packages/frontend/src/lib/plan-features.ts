export const PLAN_FEATURE_REPORT_GENERATION = "REPORT_GENERATION";
export const PLAN_FEATURE_FULL_HISTORY = "FULL_HISTORY";

export function hasPlanFeature(
  featureFlags: string[] | undefined,
  feature: string
): boolean {
  return !!featureFlags?.includes(feature);
}
