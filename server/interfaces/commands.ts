export interface Commands {
  randome_text_commands: [{
    command: string;
    texts: string[];
    repeat: number;
    roles: string[];
  }];
  text_commands: [{
    command: string;
    text: string;
    roles: string[];
  }];
}