import { temporalClient } from "../config/temporal.config.js";

export async function run(city:string) {
  const result = await temporalClient.workflow.execute(
    "onboardingWorkflow",
    {
      taskQueue: "hotel-task-queue",
      workflowId: `onboarding-${Date.now()}`,
      args: [city],
    }
  );

  await temporalClient.connection.close();
  return result;

  
}
