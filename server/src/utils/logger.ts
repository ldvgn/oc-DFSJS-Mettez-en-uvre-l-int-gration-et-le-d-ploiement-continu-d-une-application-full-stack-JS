import winston from "winston";
import { Request, Response } from "express";
import { ZodError } from "zod";

/**
 * Server logger: writes JSON logs to the console and sends them to Logstash.
 */
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "orion-server" },
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      host: process.env.LOGSTASH_HOST,
      port: 5044,
    }),
  ],
});

/**
 * Logs an event with the request details (method, path, status, duration).
 *
 * @param level - "info" (success), "warn" (4xx), "error" (5xx)
 * @param message - What happened (ex: "Contact created")
 * @param req - Express request
 * @param res - Express response (holds the start time)
 * @param status - HTTP status code sent to the client
 * @param details - Extra infos saved in one field (ex: { "error": xxx, "id": xxx })
 */
export function logRequest(
  level: "info" | "warn" | "error",
  message: string,
  req: Request,
  res: Response,
  status: number,
  details: Record<string, unknown> = {},
) {
  logger.log(level, message, {
    method: req.method,
    path: req.originalUrl.split("?")[0],
    status,
    duration_ms: Date.now() - res.locals.start,
    details: JSON.stringify(details),
  });
}

/**
 * Logs an error and sends the response: 404 (not found), 400 (invalid data) or 500.
 *
 * @param error - Error caught in the controller
 * @param req - Express request
 * @param res - Express response
 * @param messages - Messages for the 404 (notFound) and the 500 (failure)
 * @param details - Extra infos saved in the log (ex: { "id": xxx })
 */
export function handleError(
  error: unknown,
  req: Request,
  res: Response,
  messages: { notFound?: string; failure: string },
  details: Record<string, unknown> = {},
): void {
  if (
    messages.notFound &&
    error instanceof Error &&
    error.message === messages.notFound
  ) {
    logRequest("warn", messages.notFound, req, res, 404, details);
    res.status(404).json({ error: messages.notFound });
  } else if (error instanceof ZodError) {
    logRequest("warn", "Invalid input data", req, res, 400, {
      ...details,
      fields: error.issues.map((issue) => issue.path.join(".")),
    });
    res.status(400).json({ error: "Invalid input data" });
  } else {
    logRequest("error", messages.failure, req, res, 500, {
      ...details,
      error: String(error),
    });
    res.status(500).json({ error: messages.failure });
  }
}
