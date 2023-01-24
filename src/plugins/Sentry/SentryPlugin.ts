import { CaptureConsole } from '@sentry/integrations';
import * as Sentry from '@sentry/react-native';
import type { ReactNativeOptions } from '@sentry/react-native';

import type {
  InitializationError,
  InitializedPlugin,
  Plugin,
  PluginFeature,
} from 'plugins/Plugin';

export class SentryPlugin implements Plugin {
  readonly name = SentryPlugin.name;

  readonly features: PluginFeature[] = ['ErrorTracking'];

  constructor(readonly options?: ReactNativeOptions) {}

  async init(): Promise<InitializedPlugin | InitializationError> {
    if (!this.options?.dsn) {
      return { error: 'Sentry DSN is missing' };
    }

    Sentry.init({
      dsn: this.options.dsn,
      // @ts-ignore
      integrations: [new CaptureConsole({ levels: ['warn', 'error'] })],
      ...this.options,
    });

    return {
      instance: this,
      data: null,
    };
  }
}
