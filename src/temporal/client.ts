import { temporalClient } from "../config/temporal.config.js";

export async function run(city: string) {

  return await temporalClient.workflow.execute(
    "hotelOfferOrchestrationWorkflow",
    {
      taskQueue: "hotel-task-queue",
      workflowId: `hotel-offer-${Date.now()}`,
      args: [city],
    }
  );
}
