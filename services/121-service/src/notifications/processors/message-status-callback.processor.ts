import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AzureLogService } from '../../shared/services/azure-log.service';
import {
  ProcessName,
  QueueNameMessageCallBack,
} from '../enum/queue.names.enum';
import { MessageIncomingService } from '../message-incoming/message-incoming.service';
@Processor(QueueNameMessageCallBack.status)
export class MessageStatusCallbackProcessor {
  constructor(
    private readonly messageIncomingService: MessageIncomingService,
    private readonly azureLogService: AzureLogService,
  ) {}

  @Process(ProcessName.whatsapp)
  async handleStatusCallbackWhatsapp(job: Job): Promise<void> {
    const callbackData = job.data;
    await this.messageIncomingService
      .processWhatsappStatusCallback(callbackData)
      .catch((err) => {
        this.azureLogService.logError(err, false);
        throw err;
      });
  }

  @Process(ProcessName.sms)
  async handleStatusCallbackSms(job: Job): Promise<void> {
    const callbackData = job.data;
    await this.messageIncomingService
      .processSmsStatusCallback(callbackData)
      .catch((err) => {
        this.azureLogService.logError(err, false);
        throw err;
      });
  }
}
