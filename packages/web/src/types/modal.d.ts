declare module 'modal' {
  export interface ClientOptions {
    apiKey: string;
    apiSecret: string;
  }

  export class Client {
    constructor(options: ClientOptions);
    authenticate(): Promise<void>;
    readonly apps: {
      lookup(name: string, options?: { create_if_missing?: boolean }): App;
    };
  }

  export class App {
    static lookup(name: string, options?: { create_if_missing?: boolean }): App;
  }

  export class Sandbox {
    static create(options: SandboxOptions): Promise<Sandbox>;
    exec(...args: string[]): Promise<Process>;
    terminate(): Promise<void>;
  }

  export interface Process {
    stdout: AsyncIterable<string>;
  }

  export interface SandboxOptions {
    app: App;
    image: Image;
    timeout?: number;
    env?: Record<string, string>;
    mounts?: Mount[];
    workdir?: string;
  }

  export class Image {
    static debian_slim(): Image;
    pip_install(...packages: string[]): Image;
  }

  export interface Mount {
    localPath: string;
    remotePath: string;
  }
}
