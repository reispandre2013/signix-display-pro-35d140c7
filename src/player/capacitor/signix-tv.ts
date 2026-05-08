import { registerPlugin } from "@capacitor/core";

/**
 * Plugin nativo do player Android TV — interface mínima.
 * Apenas funções realmente usadas pelo player atual.
 */
export interface SignixTvPlugin {
  enterImmersive(): Promise<void>;
  setKeepScreenOn(options: { on: boolean }): Promise<void>;
}

export const SignixTv = registerPlugin<SignixTvPlugin>("SignixTv", {
  web: () => ({
    enterImmersive: async () => undefined,
    setKeepScreenOn: async () => undefined,
  }),
});
