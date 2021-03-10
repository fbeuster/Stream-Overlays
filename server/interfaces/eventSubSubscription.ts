export interface EventSubSubscription {
  id: string;
  status: string;
  typoe: string;
  version: string;
  condition: {
    broadcaster_user_id: string;
  };
  created_at: string;
  transport: {
    method: string;
    callback: string;
  };
}