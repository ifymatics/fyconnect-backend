import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express'; // Import Request from express
import { HttpException, HttpStatus } from '@nestjs/common'; // Moved imports to top

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Generic method to proxy requests
  async proxyRequest(
    serviceUrlEnvVar: string,
    originalRequest: Request // Use Express Request type
  ): Promise<any> {
    const serviceUrl = this.configService.get<string>(serviceUrlEnvVar);
    if (!serviceUrl) {
      this.logger.error(`Service URL for ${serviceUrlEnvVar} not found in environment variables.`);
      throw new Error(`Configuration error for service: ${serviceUrlEnvVar}`);
    }

    const { method, originalUrl, body, headers } = originalRequest;

    // Construct the target URL, removing the initial part of originalUrl if it's a prefix like '/api'
    // For example, if gateway is at /api/posts and posts service is at /posts
    // originalUrl might be '/api/posts/1', we want to send '/posts/1' to the service.
    // This requires careful handling of path prefixes.
    // For now, assuming the gateway path directly maps to service path after removing a base prefix.
    // Example: /api/v1/posts/* -> POST_SERVICE_URL/*
    // This logic will need to be refined based on actual routing strategy.
    // Let's assume for now originalUrl is the path to be appended to serviceUrl.
    // A common pattern is to strip a global prefix if one is set for the gateway.

    // A simple approach: if paths are like /auth/*, /posts/* at gateway level.
    // And services expect /*.
    // E.g. Gateway receives /posts/123 -> POST_SERVICE_URL/posts/123
    // This depends on how controllers are structured in services.
    // For now, let's assume the path from originalUrl is what the downstream service expects.
    const targetUrl = `${serviceUrl}${originalUrl}`;

    this.logger.log(`Proxying request: ${method} ${targetUrl}`);

    // Prepare headers: filter out host, content-length, etc., or pass specific ones.
    // Pass through important headers like Authorization.
    const requestHeaders: Record<string, string> = {};
    if (headers.authorization) {
      requestHeaders['Authorization'] = headers.authorization;
    }
    if (headers['content-type']) {
        requestHeaders['Content-Type'] = headers['content-type'];
    }
    // Add other headers as needed, e.g., custom tracing headers.


    const axiosConfig: AxiosRequestConfig = {
      method: method as any, // GET, POST, PUT, DELETE, etc.
      url: targetUrl,
      data: body,
      headers: requestHeaders,
      // httpAgent: new http.Agent({ keepAlive: true }), // For keep-alive connections
      // httpsAgent: new https.Agent({ keepAlive: true }),
    };

    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.request(axiosConfig),
      );
      // To return the response to the client, you might need to set headers and status on the gateway's response object.
      // The controller handling this will typically return { data: response.data, status: response.status, headers: response.headers }
      // For simplicity, just returning data for now. The controller will need to handle the full response.
      return { data: response.data, status: response.status, headers: response.headers };
    } catch (error) {
      this.logger.error(`Error proxying to ${targetUrl}: ${error.message}`);
      if (error.response) {
        // Forward the error response from the downstream service
        throw new HttpException(error.response.data, error.response.status);
      }
      // Generic error if no response from service (e.g., timeout, network issue)
      throw new HttpException('Error connecting to downstream service', HttpStatus.BAD_GATEWAY);
    }
  }

  // Example of specific service calls if needed, though generic proxy is more flexible
  getAuthServiceUrl = () => this.configService.get<string>('AUTH_SERVICE_URL');
  getPostServiceUrl = () => this.configService.get<string>('POST_SERVICE_URL');
  getCommentServiceUrl = () => this.configService.get<string>('COMMENT_SERVICE_URL');
  getLikeServiceUrl = () => this.configService.get<string>('LIKE_SERVICE_URL');
  getPaymentServiceUrl = () => this.configService.get<string>('PAYMENT_SERVICE_URL');

}

// Need to import HttpException and HttpStatus from @nestjs/common
import { HttpException, HttpStatus } from '@nestjs/common';
