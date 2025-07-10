import { Controller, All, Req, Res, Logger, HttpException, HttpStatus, Post, Get } from '@nestjs/common'; // Added Post, Get
import { ApiGatewayService } from './api-gateway.service';
import { Request, Response } from 'express';
import { Public } from '@app/common'; // Import Public decorator

@Controller()
export class ApiGatewayController {
  private readonly logger = new Logger(ApiGatewayController.name);

  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  private async handleProxy(serviceUrlEnvVar: string, req: Request, res: Response) {
    try {
      // The path for the downstream service should be req.originalUrl,
      // potentially stripped of a prefix if the gateway has one.
      // E.g., if gateway controller is @Controller('auth'), req.originalUrl might be '/auth/login'.
      // The serviceUrlEnvVar already points to the base of the service (e.g., http://auth:5001).
      // So, we need to ensure the path passed to the service is correct.
      // If this controller has @Controller('auth'), then req.url would be '/login'.
      // If this controller has no prefix, and routes are @All('auth/*'), req.originalUrl is '/auth/login'.
      // For now, assuming req.originalUrl is the full path the service expects after its base URL.
      // This will likely need adjustment based on how service paths are constructed.
      // Let's make the service method smarter by passing the original request.

      const { data, status, headers: responseHeaders } = await this.apiGatewayService.proxyRequest(serviceUrlEnvVar, req);

      // Forward headers from the downstream service's response
      if (responseHeaders) {
        for (const [key, value] of Object.entries(responseHeaders)) {
          // Avoid setting 'transfer-encoding' if it's chunked, as Express handles it.
          if (key.toLowerCase() !== 'transfer-encoding') {
            res.setHeader(key, value as string | string[]);
          }
        }
      }
      res.status(status).json(data);

    } catch (error) {
      this.logger.error(`Error in proxy controller for ${serviceUrlEnvVar}: ${error.message}`);
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json(error.getResponse());
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error in gateway' });
      }
    }
  }

  // Example: /api/auth/* will be proxied to AUTH_SERVICE_URL/api/auth/*
  // If AUTH_SERVICE_URL is http://auth:5001, and request is /api/auth/login
  // it will go to http://auth:5001/api/auth/login.
  // The downstream services should have their controllers set up with these base paths.
  // For instance, AuthController in auth-service might be @Controller('auth').
  // If so, the originalUrl for proxyRequest needs to be adjusted.
  // Let's assume for now services expect the full path segment after their base URL.
  // e.g. req.originalUrl = /auth/login, service expects /login
  // This means the controller path here ('auth', 'posts') is important.

  // Public routes for authentication
  @Public()
  @Post('auth/login') // Specific path for login
  async proxyToAuthLogin(@Req() req: Request, @Res() res: Response) {
    await this.handleProxy('AUTH_SERVICE_URL', req, res);
  }

  @Public()
  @Post('auth/register') // Specific path for register
  async proxyToAuthRegister(@Req() req: Request, @Res() res: Response) {
    await this.handleProxy('AUTH_SERVICE_URL', req, res);
  }

  // Potentially other public auth routes like refresh token if they don't require current JWT
  // @Public()
  // @Post('auth/refresh')
  // async proxyToAuthRefresh(@Req() req: Request, @Res() res: Response) {
  //   await this.handleProxy('AUTH_SERVICE_URL', req, res);
  // }

  // Catch-all for other /auth/* routes, which will be protected by the global guard
  @All('auth/*')
  async proxyToAuthProtected(@Req() req: Request, @Res() res: Response) {
    await this.handleProxy('AUTH_SERVICE_URL', req, res);
  }

  @All('posts/*')
  async proxyToPosts(@Req() req: Request, @Res() res: Response) {
    await this.handleProxy('POST_SERVICE_URL', req, res);
  }

  @All('comments/*')
  async proxyToComments(@Req() req: Request, @Res() res: Response) {
    await this.handleProxy('COMMENT_SERVICE_URL', req, res);
  }

  @All('likes/*')
  async proxyToLikes(@Req() req: Request, @Res() res: Response) {
    await this.handleProxy('LIKE_SERVICE_URL', req, res);
  }

  @All('payments/*')
  async proxyToPayments(@Req() req: Request, @Res() res: Response) {
    await this.handleProxy('PAYMENT_SERVICE_URL', req, res);
  }

  // Fallback for any other route, can return 404 or a generic message
  @All('*')
  default(@Req() req: Request, @Res() res: Response) {
    this.logger.warn(`No proxy route matched for: ${req.method} ${req.originalUrl}`);
    res.status(HttpStatus.NOT_FOUND).json({ message: 'Not Found via API Gateway' });
  }
}
