import { Injectable } from '@nestjs/common';
import { ServiceNowTicketingProvider } from './service-now-ticketing-provider';

@Injectable()
export class TicketingProviderFactory {
  create(config: Record<string, any>) {
    switch (config.providerType) {
      case ServiceNowTicketingProvider.name:
        return new ServiceNowTicketingProvider(config);
      default:
        throw new Error(`Unsupported provider type: ${config.providerType}`);
    }
  }
}
