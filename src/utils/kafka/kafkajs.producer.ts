import { Logger } from '@nestjs/common';
import { Kafka, Message, Producer } from 'kafkajs';
import { IProducer } from './interface';

export class KafkajsProducer implements IProducer {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly logger: Logger;

  constructor(private readonly topic: string, broker: string) {
    this.kafka = new Kafka({
      brokers: [broker],
    });
    this.producer = this.kafka.producer();
    this.logger = new Logger(topic);
  }

  async produce(message: Message) {
    await this.producer.send({ topic: this.topic, messages: [message] });
  }

  async connect() {
    try {
      await this.producer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      setTimeout(async () => {
        await this.connect();
      }, 5000);
    }
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}
