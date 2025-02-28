export type JwtPayload = {
  email?: string;
  username?: string;
  id: string;
  iat?: number;
  status?: boolean;
};
