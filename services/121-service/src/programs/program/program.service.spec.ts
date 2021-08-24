import { LookupService } from './../../notifications/lookup/lookup.service';
import { IntersolveInstructionsEntity } from './../fsp/intersolve-instructions.entity';
import { ImageCodeService } from './../../notifications/imagecode/image-code.service';
import { AfricasTalkingService } from './../fsp/africas-talking.service';
import { SmsService } from './../../notifications/sms/sms.service';
import { VoiceService } from './../../notifications/voice/voice.service';
import { repositoryMockFactory } from './../../mock/repositoryMock.factory';
import { ProgramService } from './program.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ProgramEntity } from './program.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../user/user.entity';
import { HttpModule } from '@nestjs/common';
import { TwilioMessageEntity } from '../../notifications/twilio.entity';
import { TransactionEntity } from './transactions.entity';
import { FinancialServiceProviderEntity } from '../fsp/financial-service-provider.entity';
import { ActionEntity } from '../../actions/action.entity';
import { FspCallLogEntity } from '../fsp/fsp-call-log.entity';
import { FspService } from '../fsp/fsp.service';
import { AfricasTalkingNotificationEntity } from '../fsp/africastalking-notification.entity';
import { AfricasTalkingApiService } from '../fsp/api/africas-talking.api.service';
import { IntersolveService } from '../fsp/intersolve.service';
import { IntersolveApiService } from '../fsp/api/instersolve.api.service';
import { SoapService } from '../fsp/api/soap.service';
import { WhatsappService } from '../../notifications/whatsapp/whatsapp.service';
import { ImageCodeEntity } from '../../notifications/imagecode/image-code.entity';
import { IntersolveBarcodeEntity } from '../fsp/intersolve-barcode.entity';
import { FspAttributeEntity } from '../fsp/fsp-attribute.entity';
import { ImageCodeExportVouchersEntity } from '../../notifications/imagecode/image-code-export-vouchers.entity';
import { IntersolveRequestEntity } from '../fsp/intersolve-request.entity';
import { ActionService } from '../../actions/action.service';
import { IntersolveMockService } from '../fsp/api/instersolve.mock';
import { RegistrationEntity } from '../../registration/registration.entity';
import { ProgramQuestionEntity } from './program-question.entity';

describe('Program service', (): void => {
  let service: ProgramService;
  let module: TestingModule;

  beforeAll(
    async (): Promise<void> => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [HttpModule],
        providers: [
          ProgramService,
          VoiceService,
          SmsService,
          FspService,
          AfricasTalkingService,
          AfricasTalkingApiService,
          ImageCodeService,
          IntersolveService,
          IntersolveApiService,
          IntersolveMockService,
          SoapService,
          WhatsappService,
          ActionService,
          LookupService,
          {
            provide: getRepositoryToken(ProgramEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(UserEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(ProgramQuestionEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(RegistrationEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(FinancialServiceProviderEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(FspCallLogEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(TwilioMessageEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(TransactionEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(ActionEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(AfricasTalkingNotificationEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(ImageCodeEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(ImageCodeExportVouchersEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(IntersolveBarcodeEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(FspAttributeEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(IntersolveRequestEntity),
            useFactory: repositoryMockFactory,
          },
          {
            provide: getRepositoryToken(IntersolveInstructionsEntity),
            useFactory: repositoryMockFactory,
          },
        ],
      }).compile();

      service = module.get<ProgramService>(ProgramService);
    },
  );

  afterAll(
    async (): Promise<void> => {
      module.close();
    },
  );

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });
});
