import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageTemplateModule } from '../../../notifications/message-template/message-template.module';
import { QueueMessageModule } from '../../../notifications/queue-message/queue-message.module';
import { ProgramFspConfigurationEntity } from '../../../programs/fsp-configuration/program-fsp-configuration.entity';
import { ProgramAidworkerAssignmentEntity } from '../../../programs/program-aidworker.entity';
import { ProgramEntity } from '../../../programs/program.entity';
import { RegistrationScopedRepository } from '../../../registration/registration-scoped.repository';
import { RegistrationEntity } from '../../../registration/registration.entity';
import { UserModule } from '../../../user/user.module';
import { createScopedRepositoryProvider } from '../../../utils/scope/createScopedRepositoryProvider.helper';
import { SoapService } from '../../../utils/soap/soap.service';
import { ImageCodeModule } from '../../imagecode/image-code.module';
import { TransactionEntity } from '../../transactions/transaction.entity';
import { TransactionsModule } from '../../transactions/transactions.module';
import { CustomHttpService } from './../../../shared/services/custom-http.service';
import { IntersolveVoucherApiService } from './instersolve-voucher.api.service';
import { IntersolveVoucherMockService } from './instersolve-voucher.mock';
import { IntersolveIssueVoucherRequestEntity } from './intersolve-issue-voucher-request.entity';
import { IntersolveVoucherInstructionsEntity } from './intersolve-voucher-instructions.entity';
import { IntersolveVoucherController } from './intersolve-voucher.controller';
import { IntersolveVoucherEntity } from './intersolve-voucher.entity';
import { IntersolveVoucherService } from './intersolve-voucher.service';
import { IntersolveVoucherCronService } from './services/intersolve-voucher-cron.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      IntersolveIssueVoucherRequestEntity,
      IntersolveVoucherInstructionsEntity,
      RegistrationEntity,
      TransactionEntity,
      ProgramEntity,
      ProgramFspConfigurationEntity,
      ProgramAidworkerAssignmentEntity,
      IntersolveVoucherEntity,
    ]),
    ImageCodeModule,
    UserModule,
    TransactionsModule,
    QueueMessageModule,
    MessageTemplateModule,
  ],
  providers: [
    IntersolveVoucherService,
    IntersolveVoucherApiService,
    SoapService,
    IntersolveVoucherMockService,
    IntersolveVoucherCronService,
    CustomHttpService,
    RegistrationScopedRepository,
    createScopedRepositoryProvider(IntersolveVoucherEntity),
  ],
  controllers: [IntersolveVoucherController],
  exports: [
    IntersolveVoucherService,
    IntersolveVoucherApiService,
    IntersolveVoucherMockService,
    IntersolveVoucherCronService,
  ],
})
export class IntersolveVoucherModule {}
