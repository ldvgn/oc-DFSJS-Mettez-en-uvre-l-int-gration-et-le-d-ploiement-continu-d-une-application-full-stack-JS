import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger, logRequest } from "./utils/logger";
import organizationRoutes from "./routes/organizationRoutes";
import contactRoutes from "./routes/contactRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Saves the request start time, used for duration_ms in the logs
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.locals.start = Date.now();
  next();
});

// Routes
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", message: "Orion CRM API is running" });
});

app.use("/api/organizations", organizationRoutes);
app.use("/api/contacts", contactRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  logRequest("warn", "Route not found", req, res, 404);
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logRequest("error", "Internal server error", req, res, 500, {
    stack: err.stack,
  });
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
