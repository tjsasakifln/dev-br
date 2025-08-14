// GitHub allowed users management
export interface AllowedUser {
  username: string;
  permissions: string[];
}

const ALLOWED_USERS: AllowedUser[] = [
  // Add allowed users here
];

export function isAllowedUser(username: string): boolean {
  return ALLOWED_USERS.some(user => user.username === username);
}

export function getUserPermissions(username: string): string[] {
  const user = ALLOWED_USERS.find(user => user.username === username);
  return user?.permissions || [];
}