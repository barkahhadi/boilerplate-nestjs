import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { KafkajsProducer } from './kafkajs.producer';
import { IProducer, KafkajsSettings } from './interface';

@Injectable()
export class ProducerService implements OnApplicationShutdown {
  private readonly producers = new Map<string, IProducer>();
  private settings: KafkajsSettings;

  constructor(@Inject('KAFKA_SETTINGS') settings: KafkajsSettings = null) {
    this.settings = settings;
  }

  async produce(topic: string, message: Object) {
    const producer = await this.getProducer(topic);
    await producer.produce({
      value: JSON.stringify(message),
    });
  }

  private async getProducer(topic: string) {
    let producer = this.producers.get(topic);
    if (!producer) {
      producer = new KafkajsProducer(topic, this.settings.broker);
      await producer.connect();
      this.producers.set(topic, producer);
    }
    return producer;
  }

  async onApplicationShutdown() {
    for (const producer of this.producers.values()) {
      await producer.disconnect();
    }
  }
}
