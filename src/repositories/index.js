import { CollectionRepository } from './collectionRepository.js';
import { ConfigRepository } from './configRepository.js';

export function createRepositories() {
  return {
    config: new ConfigRepository(),
    products: new CollectionRepository('products.json'),
    panels: new CollectionRepository('panels.json'),
    orders: new CollectionRepository('orders.json'),
    tickets: new CollectionRepository('tickets.json'),
    warns: new CollectionRepository('warns.json'),
  };
}
