export interface Subscriptions {
  data: {
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
    gifter_id: string;
    gifter_login: string;
    gifter_name: string;
    is_gift: boolean;
    tier: string;
    plan_name: string;
    user_id: string;
    user_name: string;
    user_login: string;
  }[];
  pagination: {
    cursor: string;
  };
  total: number;
  points: number;
}