import winston from "winston";
import { Request, Response } from "express";

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
