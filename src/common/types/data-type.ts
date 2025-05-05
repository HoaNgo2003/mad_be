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
export enum EReact {
  like = 'like',
  dislike = 'dislike',
}

export enum ETypeNoti {
  comment = 'comment',
  like = 'like',
  follow = 'follow',
  post = 'post',
  task = 'task',
  share = 'share',
}
