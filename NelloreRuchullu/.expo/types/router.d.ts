/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/cart` | `/(tabs)/orders` | `/(tabs)/profile` | `/(tabs)/search` | `/_root` | `/_sitemap` | `/cart` | `/checkout` | `/login` | `/notifications` | `/onboarding` | `/orders` | `/profile` | `/register` | `/search` | `/splash`;
      DynamicRoutes: `/restaurant/${Router.SingleRoutePart<T>}` | `/track/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/restaurant/[id]` | `/track/[id]`;
    }
  }
}
