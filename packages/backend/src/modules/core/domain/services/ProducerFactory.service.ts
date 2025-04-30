// filepath: c:\Users\notho\Documents\github\Agroscope\packages\backend\src\modules\core\domain\services\ProducerFactory.service.ts
import { ProducerService } from './Producer.service';

export type ProducerType = 'image' | 'email';

export interface ProducerFactoryService {
    createProducer(type: ProducerType): ProducerService;
}
