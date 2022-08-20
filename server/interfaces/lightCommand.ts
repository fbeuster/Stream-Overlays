export interface LightCommand {
  name: string;
  value: number;
  reset: boolean;
  delay?: number;
  color?: string;
}