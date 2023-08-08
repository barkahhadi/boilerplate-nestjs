import { ConsumerConfig, ConsumerSubscribeTopics, KafkaMessage } from 'kafkajs';

export interface KafkajsSettings {
  broker: string;
}

export interface KafkajsConsumerOptions {
  topics: ConsumerSubscribeTopics;
  config: ConsumerConfig;
  onMessage: (message: Object) => Promise<void>;
}

export interface IProducer {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  produce: (message: any) => Promise<void>;
}

export interface IConsumer {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  consume: (message: any) => Promise<void>;
}
