import { EventAction } from './eventAction';

export interface Events {
  debug_events: {
    [k: string]: {
      actions: EventAction[];
    }
  },
  subscription_events: {
    [k: string]: {
      actions: EventAction[];
    }
  };
}