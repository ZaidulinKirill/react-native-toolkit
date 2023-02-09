import { AppEventsLogger } from 'react-native-fbsdk-next';

import { Plugin, PluginFeature } from 'plugins/Plugin';
import type { IAnalyticsProvider } from 'plugins/types';

export class FacebookPlugin extends Plugin implements IAnalyticsProvider {
  readonly name = 'FacebookPlugin';

  readonly features: PluginFeature[] = ['Analytics'];

  /**
   * Requires FACEBOOK_APP_ID and FACEBOOK_CLIENT_TOKEN environment variables to exist
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  async initialize() {}

  async logEvent(event: string, parameters?: Record<string, any> | undefined) {
    AppEventsLogger.logEvent(event, parameters as any);
  }
}
