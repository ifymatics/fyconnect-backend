import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class AdminServiceService {
  private readonly logger = new Logger(AdminServiceService.name);
  private API_GATEWAY_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.API_GATEWAY_URL = this.configService.getOrThrow<string>('API_GATEWAY_URL');
  }

  private async makeGatewayRequest(method: string, path: string, token?: string, data?: any): Promise<any> {
    const url = `${this.API_GATEWAY_URL}/${path}`;
    this.logger.debug(`Making admin request to Gateway: ${method} ${url}`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = token; // Assuming token is "Bearer <jwt>"
    }

    const axiosConfig: AxiosRequestConfig = {
      method: method as any,
      url,
      data,
      headers,
    };

    try {
      const response = await firstValueFrom(this.httpService.request(axiosConfig));
      return response.data;
    } catch (error) {
      this.logger.error(`Error calling ${url}: ${error.message}`, error.stack);
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Error connecting to API Gateway or downstream service', HttpStatus.BAD_GATEWAY);
    }
  }

  async getAllUsers(adminToken: string): Promise<any[]> {
    // Assuming auth-service exposes an admin-protected route like /auth/admin/users via gateway at /auth/admin/users
    // The adminToken would be the JWT of a logged-in admin user.
    // This requires the API Gateway to correctly proxy /auth/* routes
    // And auth-service to have an endpoint at /admin/users (or similar) protected for admin roles.
    // For now, let's assume /auth/users is an admin endpoint.
    // This also assumes UserDto in auth-service doesn't strip sensitive info by default.
    return this.makeGatewayRequest('GET', 'auth/users', adminToken);
  }

  async getAllPosts(adminToken: string): Promise<any[]> {
    // Assuming post-service exposes /posts via gateway at /posts
    // And this endpoint might need admin privileges if it shows all posts without filtering.
    // Or, it might be a public endpoint just aggregated here.
    // For now, assume adminToken is passed for consistency, can be made optional if endpoint is public.
    return this.makeGatewayRequest('GET', 'posts', adminToken);
  }

  async deleteUser(userId: string, adminToken: string): Promise<any> {
    // Example: DELETE /auth/users/:userId (admin protected)
    // This would require auth-service to implement this endpoint.
    return this.makeGatewayRequest('DELETE', `auth/users/${userId}`, adminToken);
  }

  async deletePost(postId: number, adminToken: string): Promise<any> {
    // Example: DELETE /posts/:postId (admin protected)
    // This would require post-service to implement this endpoint.
    return this.makeGatewayRequest('DELETE', `posts/${postId}`, adminToken);
  }

  // Add other admin functionalities:
  // - Get all comments, delete comment
  // - Get all likes
  // - View payment transactions
  // - etc.
}
