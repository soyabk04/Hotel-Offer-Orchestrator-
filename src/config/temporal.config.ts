import { Connection, Client } from "@temporalio/client";

const temporalAddress =
  process.env.TEMPORAL_ADDRESS || "localhost:7233";

export const temporalConnection = await Connection.connect({
  address: temporalAddress,
});

export const temporalClient = new Client({
  connection: temporalConnection,
});