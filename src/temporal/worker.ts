import { Worker, NativeConnection } from "@temporalio/worker";
import path from "node:path";
import * as activities from "./activities/hotel.activities.js";

async function run() {
  const temporalAddress =
    process.env.TEMPORAL_ADDRESS || "localhost:7233";

  console.log("Temporal address:", temporalAddress);

  const connection = await NativeConnection.connect({
    address: temporalAddress,
  });

  const workflowPath = path.resolve(
    process.cwd(),
    "dist",
    "temporal",
    "workflow.js"
  );

  console.log("Workflow path:", workflowPath);

  const worker = await Worker.create({
    connection,
    workflowsPath: workflowPath,
    activities,
    taskQueue: "hotel-task-queue",
  });

  

  await worker.run();
}

run().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});