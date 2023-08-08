import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { KafkajsConsumer } from './kafkajs.consumer';
import {
  KafkajsConsumerOptions,
  IConsumer,
  KafkajsSettings,
} from './interface';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly consumers: IConsumer[] = [];
  private readonly settings: KafkajsSettings;

  constructor(@Inject('KAFKA_SETTINGS') settings: KafkajsSettings = null) {
    this.settings = settings;
  }

  async consume({ topics, config, onMessage }: KafkajsConsumerOptions) {
    const consumer = new KafkajsConsumer(topics, config, this.settings.broker);
    await consumer.connect();
    await consumer.consume(onMessage);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
