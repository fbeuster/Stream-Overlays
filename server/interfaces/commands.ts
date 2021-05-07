export interface Commands {
  dances: string[];
  text_commands: [{
    command: string;
    text: string;
    roles: string[];
  }];
}