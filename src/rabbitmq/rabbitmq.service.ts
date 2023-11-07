import { JOB_NAME } from "src/workers/worker.constant";

import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class RabbitMQService {
  constructor(@Inject("WORKER_SERVICE") private client: ClientProxy) {}

  async testRmq(): Promise<boolean> {
    try {
      await this.client.emit(JOB_NAME.TEST_RABBIT, {
        test: `${new Date().toLocaleDateString()}`,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async sendDataToRabbitMQ(jobName: string, data: any) {
    try {
      await this.client.emit(jobName, JSON.stringify(data));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
