export interface Commands {
  randome_text_commands: [{
    command: string;
    texts: string[];
    repeat: number;
    roles: string[];
  }];
  repeated_text_commands: [{
    texts: string[];
    interval: number;
  }];
  text_commands: [{
    command: string;
    text: string;
    roles: string[];
  }];
}