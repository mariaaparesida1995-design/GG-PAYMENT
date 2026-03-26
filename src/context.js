import { createRepositories } from '../repositories/index.js';
import { BackupService } from '../services/backupService.js';
import { LogService } from '../services/logService.js';
import { MercadoPagoService } from '../services/mercadoPagoService.js';
import { ModerationService } from '../services/moderationService.js';
import { OrderService } from '../services/orderService.js';
import { PanelService } from '../services/panelService.js';
import { PaymentService } from '../services/paymentService.js';
import { ProductService } from '../services/productService.js';
import { StatsService } from '../services/statsService.js';
import { TicketService } from '../services/ticketService.js';
import { VerificationService } from '../services/verificationService.js';
import { RuntimeStore } from '../stores/runtimeStore.js';

export function createAppContext() {
  const repositories = createRepositories();
  const runtime = new RuntimeStore();
  const logService = new LogService(repositories);
  const mercadoPagoService = new MercadoPagoService();
  const productService = new ProductService(repositories, logService);
  const panelService = new PanelService(repositories, productService);
  const ticketService = new TicketService(repositories, logService);
  const paymentService = new PaymentService(repositories, mercadoPagoService, logService);
  const orderService = new OrderService(repositories, productService, paymentService, ticketService, logService);
  const verificationService = new VerificationService(repositories, logService);
  const moderationService = new ModerationService(repositories, logService);
  const statsService = new StatsService(repositories);
  const backupService = new BackupService(repositories);
  return { repositories, runtime, services: { logService, mercadoPagoService, moderationService, orderService, panelService, paymentService, productService, statsService, ticketService, verificationService, backupService } };
}

