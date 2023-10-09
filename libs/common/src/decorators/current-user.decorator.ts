/* eslint-disable prettier/prettier */
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UsersDocument } from 'apps/auth/src/users/schemas/user.schema';

const getCurrentUserByContext = (context: ExecutionContext): UsersDocument => {
  return context.switchToHttp().getRequest().user;
};

export const currentUser = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) =>
    getCurrentUserByContext(executionContext),
);
