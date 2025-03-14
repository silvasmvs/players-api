import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

export class AllExceptionFilter implements ExceptionFilter {

    private readonly logger = new Logger(AllExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const statusCode = 
        exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = 
        exception instanceof HttpException
        ? exception.getResponse() : exception;

        this.logger.error(`Http Status: ${statusCode} - Error message: ${JSON.stringify(message)}`);

        response.status(statusCode).json({
            timestamp: new Date().toISOString,
            path: request.url,
            error: message
        });
    }
}