import initializeRemoteConfig from '@react-native-firebase/remote-config';

import {
  InitializationError,
  InitializationOptions,
  InitializedPlugin,
  Plugin,
  PluginFeature,
} from 'plugins/Plugin';
import type { RemoteConfig } from 'plugins/types';

export class FirebasePlugin extends Plugin {
  readonly name = FirebasePlugin.name;

  readonly features: PluginFeature[] = ['RemoteConfig'];

  readonly remoteConfig?: RemoteConfig;

  constructor(
    options: {
      remoteConfig?: RemoteConfig;
    } & InitializationOptions = {},
  ) {
    super(options);
    this.remoteConfig = options.remoteConfig;
  }

  async init(): Promise<InitializedPlugin | InitializationError> {
    try {
      const data: Record<string, any> = {};

      if (this.remoteConfig) {
        const config = initializeRemoteConfig();

        await config.setConfigSettings({ minimumFetchIntervalMillis: 0 });
        await config.setDefaults({ ...this.remoteConfig });

        await config.fetch(0);
        await config.activate();

        data.remoteConfig = Object.fromEntries(
          Object.entries(this.remoteConfig).map(([key, defaultValue]) => {
            if (typeof defaultValue === 'string') {
              return [key, config.getString(key)];
            }

            if (typeof defaultValue === 'boolean') {
              return [key, config.getBoolean(key)];
            }

            if (typeof defaultValue === 'number') {
              return [key, config.getNumber(key)];
            }

            return [
              key,
              JSON.parse(
                // @ts-ignore
                // eslint-disable-next-line no-underscore-dangle
                config.getValue(key)._value,
              ),
            ];
          }),
        );
      }

      return {
        instance: this,
        data,
      };
    } catch (err) {
      return { error: (err as Error).message };
    }
  }
}
