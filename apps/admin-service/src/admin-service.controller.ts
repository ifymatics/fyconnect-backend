import { Controller, Get, Delete, Param, UseGuards, Headers, ParseIntPipe } from '@nestjs/common';
import { AdminServiceService } from './admin-service.service';
import { JwtAuthGuard } from '@app/common'; // Assuming a common JwtAuthGuard

@Controller('admin') // Base path for all admin routes
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class AdminServiceController {
  constructor(private readonly adminServiceService: AdminServiceService) {}

  // Helper to extract token. In a real app, this might be part of a custom decorator or enhanced guard.
  private extractToken(authorizationHeader: string): string {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      // This should ideally be caught by JwtAuthGuard if token is missing/malformed
      return undefined;
    }
    return authorizationHeader; //.split(' ')[1]; // Guard already validates, just pass it on
  }

  @Get('users')
  async getAllUsers(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    // Here, the token itself might be used by the downstream service to verify admin role,
    // or this admin-service itself could decode it to check for an admin role before proceeding.
    // For now, just passing it.
    return this.adminServiceService.getAllUsers(token);
  }

  @Delete('users/:userId')
  async deleteUser(
    @Param('userId') userId: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.adminServiceService.deleteUser(userId, token);
  }

  @Get('posts')
  async getAllPosts(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.adminServiceService.getAllPosts(token);
  }

  @Delete('posts/:postId')
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Headers('authorization') authHeader: string,
  ) {
    const token = this.extractToken(authHeader);
    return this.adminServiceService.deletePost(postId, token);
  }

  // Add more admin endpoints as needed:
  // GET /admin/comments
  // DELETE /admin/comments/:commentId
  // GET /admin/payments
}
