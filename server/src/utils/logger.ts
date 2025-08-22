import pino from "pino";

export const logger = pino({
	level: process.env.LOG_LEVEL || "info",
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "SYS:standard",
			ignore: "pid,hostname"
		}
	}
});

export const logSecurityEvent = (event: string, details: Record<string, unknown>, userId?: number, ip?: string) => {
	logger.warn({
		event: "SECURITY",
		type: event,
		userId,
		ip,
		details,
		timestamp: new Date().toISOString()
	});
};

export const logAuthEvent = (event: string, userId?: number, ip?: string, success: boolean = true) => {
	logger.info({
		event: "AUTH",
		type: event,
		userId,
		ip,
		success,
		timestamp: new Date().toISOString()
	});
};

export const logCRUDEvent = (operation: string, resource: string, resourceId: number, userId: number) => {
	logger.info({
		event: "CRUD",
		operation,
		resource,
		resourceId,
		userId,
		timestamp: new Date().toISOString()
	});
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
	logger.error({
		event: "ERROR",
		message: error.message,
		stack: error.stack,
		context,
		timestamp: new Date().toISOString()
	});
};
