import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MessageContentType } from '../notifications/message-type.enum';
import { WhatsappService } from '../notifications/whatsapp/whatsapp.service';
import { IntersolvePayoutStatus } from '../payments/fsp-integration/intersolve/enum/intersolve-payout-status.enum';
import { IntersolveBarcodeEntity } from '../payments/fsp-integration/intersolve/intersolve-barcode.entity';
import { IntersolveService } from '../payments/fsp-integration/intersolve/intersolve.service';
import { TransactionEntity } from '../payments/transactions/transaction.entity';
import { ProgramEntity } from '../programs/program.entity';
import { CustomDataAttributes } from '../registration/enum/custom-data-attributes';
import { RegistrationEntity } from '../registration/registration.entity';

@Injectable()
export class CronjobService {
  @InjectRepository(RegistrationEntity)
  private readonly registrationRepository: Repository<RegistrationEntity>;
  @InjectRepository(TransactionEntity)
  private readonly transactionRepository: Repository<TransactionEntity>;
  @InjectRepository(ProgramEntity)
  private readonly programRepository: Repository<ProgramEntity>;

  private readonly fallbackLanguage = 'en';

  public constructor(
    private whatsappService: WhatsappService,
    private readonly intersolveService: IntersolveService,
    private readonly dataSource: DataSource,
  ) {}

  private async getLanguageForRegistration(
    referenceId: string,
  ): Promise<string> {
    const registration = await this.registrationRepository.findOneBy({
      referenceId: referenceId,
    });

    if (registration && registration.preferredLanguage) {
      return registration.preferredLanguage;
    }
    return this.fallbackLanguage;
  }

  private getNotificationText(
    program: ProgramEntity,
    type: string,
    language?: string,
  ): string {
    if (
      program.notifications[language] &&
      program.notifications[language][type]
    ) {
      return program.notifications[language][type];
    }
    return program.notifications[this.fallbackLanguage][type];
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  private async cacheUnusedVouchers(): Promise<void> {
    const programs = await this.programRepository.find();
    for (const program of programs) {
      this.intersolveService.getUnusedVouchers(program.id);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  private async cronSendWhatsappReminders(): Promise<void> {
    console.log('CronjobService - Started: cronSendWhatsappReminders');
    const sixteenHours = 16 * 60 * 60 * 1000;
    const sixteenHoursAgo = new Date(Date.now() - sixteenHours);
    const programs = await this.programRepository.find();
    for (const program of programs) {
      const intersolveBarcodeRepository = this.dataSource.getRepository(
        IntersolveBarcodeEntity,
      );
      // Don't send more then 3 vouchers, so no vouchers of more than 2 payments ago
      const lastPayment = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('MAX(transaction.payment)', 'max')
        .where('transaction.programId = :programId', {
          programId: program.id,
        })
        .getRawOne();
      const minimumPayment = lastPayment ? lastPayment.max - 2 : 0;

      const unsentIntersolveBarcodes = await intersolveBarcodeRepository
        .createQueryBuilder('barcode')
        .select([
          'barcode.id as id',
          '"whatsappPhoneNumber"',
          'registration."referenceId" AS "referenceId"',
          'amount',
          '"reminderCount"',
        ])
        .leftJoin('barcode.image', 'image')
        .leftJoin('image.registration', 'registration')
        .where('send = false')
        .andWhere('barcode.created < :sixteenHoursAgo', {
          sixteenHoursAgo: sixteenHoursAgo,
        })
        .andWhere('"whatsappPhoneNumber" is not NULL')
        .andWhere('barcode.payment >= :minimumPayment', {
          minimumPayment: minimumPayment,
        })
        .andWhere('registration.programId = :programId', {
          programId: program.id,
        })
        .andWhere('barcode."reminderCount" < 3')
        .getRawMany();

      for (const unsentIntersolveBarcode of unsentIntersolveBarcodes) {
        const referenceId = unsentIntersolveBarcode.referenceId;
        const registration = await this.registrationRepository.findOne({
          where: { referenceId: referenceId },
          relations: ['program'],
        });
        const fromNumber = await registration.getRegistrationDataValueByName(
          CustomDataAttributes.whatsappPhoneNumber,
        );
        const language = await this.getLanguageForRegistration(referenceId);
        let whatsappPayment = this.getNotificationText(
          registration.program,
          'whatsappPayment',
          language,
        );
        whatsappPayment = whatsappPayment
          .split('{{1}}')
          .join(unsentIntersolveBarcode.amount);

        await this.whatsappService.sendWhatsapp(
          whatsappPayment,
          fromNumber,
          IntersolvePayoutStatus.InitialMessage,
          null,
          registration.id,
          MessageContentType.paymentReminder,
        );
        const reminderBarcode = await intersolveBarcodeRepository.findOne({
          where: { id: unsentIntersolveBarcode.id },
        });

        reminderBarcode.reminderCount += 1;
        intersolveBarcodeRepository.save(reminderBarcode);
      }

      console.log(
        `cronSendWhatsappReminders: ${unsentIntersolveBarcodes.length} unsent Intersolve barcodes for program: ${program.id}`,
      );
    }
    console.log('CronjobService - Complete: cronSendWhatsappReminders');
  }
}
