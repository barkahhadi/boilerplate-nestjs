import { Logger } from '@nestjs/common';
import {
  Consumer,
  ConsumerConfig,
  ConsumerSubscribeTopics,
  Kafka,
  KafkaMessage,
} from 'kafkajs';
import retry from 'async-retry';
import { IConsumer } from './interface';

export class KafkajsConsumer implements IConsumer {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger: Logger;

  constructor(
    private readonly topics: ConsumerSubscribeTopics,
    config: ConsumerConfig,
    broker: string,
  ) {
    this.kafka = new Kafka({ brokers: [broker] });
    this.consumer = this.kafka.consumer(config);
    this.logger = new Logger(`${topics.topics}-${config.groupId}`);
  }

  async consume(onMessage: (message: Object) => Promise<void>) {
    await this.consumer.subscribe(this.topics);
    await this.consumer.run({
      eachMessage: async ({ message, partition }) => {
        this.logger.debug(`Processing message on partition: ${partition}`);
        try {
          let messageData: Object = null;
          if (message && message.value) {
            messageData = JSON.parse(message.value.toString());
          } else {
            throw new Error('Failed to parse message');
          }
          await retry(async () => onMessage(messageData), {
            retries: 3,
            onRetry: (error, attempt) =>
              this.logger.error(
                `Error consuming message, retrying ${attempt}/3...`,
                error,
              ),
          });
        } catch (err) {
          this.logger.error(
            'Error consuming message. Adding to dead letter queue...',
            err,
          );
          // add message to dead letter queue in database
        }
      },
    });
  }

  async connect() {
    try {
      await this.consumer.connect();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka.', err);
      setTimeout(async () => {
        await this.connect();
      }, 5000);
    }
  }

  async disconnect() {
    await this.consumer.disconnect();
  }
}
