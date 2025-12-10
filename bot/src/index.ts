import dotenv from "dotenv";
import { launchBot } from "./apiServer";

dotenv.config();

launchBot().catch((err) => {
  console.error("Failed to launch bot", err);
  process.exit(1);
});
