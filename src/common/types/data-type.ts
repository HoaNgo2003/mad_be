export type JwtPayload = {
  email?: string;
  username?: string;
  id: string;
  iat?: number;
  status?: boolean;
};

export enum ESchedule {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  biomonthly = 'biomonthly',
}
