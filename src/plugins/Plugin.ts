export type PluginFeature = 'ErrorTracking' | 'RemoteConfig';

export type InitializedPlugin = {
  instance: Plugin,
  data: any
};

export interface Plugin {
  readonly name: string;
  readonly features: PluginFeature[];

  init: (bundle: InitializedPlugin[]) => Promise<InitializedPlugin | string>
}