import { Injectable } from '@nestjs/common';

export interface SSHConnection {
  host: string;
  username: string;
  privateKey: string;
}

@Injectable()
export class SshService {
  async executeCommand(connection: SSHConnection, command: string) {
    throw new Error('Not implemented');
  }
}
