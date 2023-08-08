import { Global, Module } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';
import { KafkajsSettings } from './interface';

@Global()
@Module({
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService],
})
export class KafkaModule {
  static forRoot(settings: KafkajsSettings) {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_SETTINGS',
          useValue: settings,
        },
        ProducerService,
        ConsumerService,
      ],
      exports: [ProducerService, ConsumerService],
    };
  }
}
