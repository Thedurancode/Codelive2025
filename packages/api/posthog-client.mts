import { PostHog } from 'posthog-node';
import { getConfig } from './config.mjs';
import { IS_PRODUCTION } from './constants.mjs';

const client = new PostHog(
  'phc_Hmyy7jBw4ckBGWz8JNaXSZF231JBNrzCRiRAVNK4Y8e',
  { host: 'https://us.i.posthog.com' }
);

type EventType = {
  event: string;
  properties?: Record<string, any>;
};

class PostHogClient {
  private installId: string;

  constructor(config: { installId: string }) {
    this.installId = config.installId;
  }

  private get analyticsEnabled(): boolean {
    const disabled = process.env.SRCBOOK_DISABLE_ANALYTICS || '';
    return disabled.toLowerCase() !== 'true';
  }

  private get isEnabled(): boolean {
    return this.analyticsEnabled && IS_PRODUCTION;
  }

  public capture(event: EventType): void {
    if (!this.isEnabled) {
      return;
    }

    client.capture({ ...event, distinctId: this.installId });
  }

  public shutdown() {
    client.shutdown();
  }
}

export const posthog = new PostHogClient(await getConfig());
