export interface TokenPayload {
  userId: string;
  // You might include other non-sensitive payload data here if needed, like email or roles,
  // depending on what auth-service puts into the JWT.
  // For now, keeping it minimal to match the original.
  // email?: string;
}
