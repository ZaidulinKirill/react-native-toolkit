import type { InitializedPlugin, Plugin, PluginFeature } from 'plugins/Plugin';
import { Platform } from 'react-native';
import * as IAP from 'react-native-iap';
import { transformProduct } from './utils/transformProduct';
import { transformSubscription } from './utils/transformSubscription';

export class InAppPurchasePlugin implements Plugin {
  readonly name = InAppPurchasePlugin.name;

  readonly features: PluginFeature[] = ['InAppPurchase'];

  constructor(
    readonly options: {
      products: { productId: string, type: 'subscription' | 'product' }[],
      verbose?: boolean
    },
  ) {}

  async init(): Promise<InitializedPlugin | string> {
    try {
      /*
      1. initialization
      2. product fetch
      3. unify product model
      */

      const canMakePayments = await IAP.initConnection();
      // eslint-disable-next-line no-console
      console.info({ canMakePayments });

      if (Platform.OS === 'android') {
        try {
          await IAP.flushFailedPurchasesCachedAsPendingAndroid();
        } catch (err) {
          // skip error
        }
      }

      if (Platform.OS === 'ios') {
        try {
          await IAP.clearTransactionIOS();
        } catch (err) {
          // skip error
        }
      }

      const productSkus = this.options.products.filter((x) => x.type === 'product').map((x) => x.productId);
      const subscriptionSkus = this.options.products.filter((x) => x.type === 'subscription').map((x) => x.productId);

      const [fetchedProducts, fetchedSubscriptions] = await Promise.all([
        productSkus.length
          ? IAP.getProducts({ skus: productSkus })
          : Promise.resolve([]),
        subscriptionSkus.length
          ? IAP.getSubscriptions({ skus: subscriptionSkus })
          : Promise.resolve([]),
      ]);

      const products = fetchedProducts.map(transformProduct);
      const subscriptions = fetchedSubscriptions.map((x) => transformSubscription(x, false));

      return {
        instance: this,
        data: {
          subscriptions,
          products,
        },
      };
    } catch (err) {
      IAP.endConnection();

      return (err as Error).message;
    }
  }
}
