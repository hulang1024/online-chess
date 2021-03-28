declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

declare module 'current-device';

declare class FontFace {
  constructor(name: string, url: string);
  load(): Promise<void>;
}

interface Window {
  FontFace: FontFace;
}

declare class FontFaceSet {
  add(font: unknown): void;
}

interface Document {
  fonts: FontFaceSet;
}