export interface EventAction {
  name: string;
  condition_property?: string[];
  condition_value?: string | number | boolean;
  data: any;
}