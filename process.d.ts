// Extend the NodeJS.Process interface to include the `send` method.
declare module 'process' {
    export interface Process extends NodeJS.Process {
      send?: ((message: any) => void) | undefined;
    }
  }
  