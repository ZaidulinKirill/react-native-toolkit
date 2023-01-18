import type { InitializedPlugin, Plugin } from 'plugins/Plugin';
import React, { useCallback, useState } from 'react';
import { hide as hideNativeSplash } from 'react-native-bootsplash';
import useAsyncEffect from 'use-async-effect';
import { AppSplashScreen } from 'components/AppSplashScreen';
import type { AppSplashScreenProps } from 'components/AppSplashScreen/AppSplashScreen';
import { useAlerts } from 'hooks/useAlerts';
import { Button, Text, View } from 'react-native';
import { PluginsBundleProvider } from 'contexts/PluginsBundleContext/PluginsBundleContext';

type Props = {
  children?: React.ReactNode,
  plugins?: Plugin[],
  splashScreenProps?: Omit<AppSplashScreenProps, 'visible' | 'children'>
};

export default function AppBootstrapper({ children, plugins, splashScreenProps }: Props) {
  const { showAlert } = useAlerts();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [pluginsBundle, setPluginsBundle] = useState<InitializedPlugin[]>([]);

  const initialize = useCallback(async () => {
    if (!plugins) {
      return;
    }

    const currentPluginBundle: InitializedPlugin[] = [];

    for (let i = 0; i < plugins.length; i += 1) {
      const plugin = plugins[i];

      // eslint-disable-next-line no-await-in-loop
      const result = await plugin.init(currentPluginBundle);
      if (typeof result === 'string') {
        throw new Error(result);
      }

      currentPluginBundle.push(result);
    }

    setPluginsBundle(currentPluginBundle);
  }, [plugins]);

  useAsyncEffect(async () => {
    try {
      await initialize();
    } catch (err) {
      setInitializationError((err as Error).message);
      console.error(err);
    } finally {
      setIsInitialized(true);
      hideNativeSplash();
    }
  }, []);

  return (
    <AppSplashScreen
      visible={!isInitialized}
      {...splashScreenProps}
    >
      {!initializationError
        ? (
          <PluginsBundleProvider plugins={pluginsBundle}>
            {children}
          </PluginsBundleProvider>
        )
        : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>{initializationError}</Text>
            <Button
              disabled={isRetrying}
              onPress={async () => {
                try {
                  setIsRetrying(true);
                  await initialize();

                  setInitializationError(null);
                } catch (err) {
                  showAlert('error', 'Error', (err as Error).message);
                  setInitializationError((err as Error).message);
                } finally {
                  setIsRetrying(false);
                }
              }}
              title="Retry"
            />
          </View>
        )}

    </AppSplashScreen>
  );
}
