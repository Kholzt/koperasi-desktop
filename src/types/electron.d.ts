export {};

declare global {
  interface Window {
    appPath: {
      getUserDataPath: () => Promise<string>;
    };
  }
}