export * from './categoryController.service';
import { CategoryControllerService } from './categoryController.service';
export * from './itemController.service';
import { ItemControllerService } from './itemController.service';
export const APIS = [CategoryControllerService, ItemControllerService];
