import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RegistrationStatusEnum } from '../../../../../../services/121-service/src/registration/enum/registration-status.enum';
import { AuthService } from '../../auth/auth.service';
import Permission from '../../auth/permission.enum';
import { Person } from '../../models/person.model';
import {
  PaTableAttribute,
  Program,
  ProgramPhase,
} from '../../models/program.model';
import { EditPersonAffectedPopupComponent } from '../../program/edit-person-affected-popup/edit-person-affected-popup.component';
import { PaymentHistoryPopupComponent } from '../../program/payment-history-popup/payment-history-popup.component';
import { ProgramsServiceApiService } from '../../services/programs-service-api.service';
import { PubSubEvent, PubSubService } from '../../services/pub-sub.service';
import { TranslatableStringService } from '../../services/translatable-string.service';

class TableItem {
  label: string;
  value: string;
}

class ActivityOverviewItem {
  type: string;
  label: string;
  date: Date;
  description: string;
}

enum ActivityOverviewType {
  message = 'message',
  status = 'status',
  payment = 'payment',
}
@Component({
  selector: 'app-registration-details',
  templateUrl: './registration-details.page.html',
  styleUrls: ['./registration-details.page.css'],
})
export class RegistrationDetailsPage implements OnInit, OnDestroy {
  public programId = this.route.snapshot.params.id;
  public paId = this.route.snapshot.params.paId;

  private program: Program;
  public person: Person;
  public personalInfoTable: TableItem[];
  public paymentsTable: TableItem[];
  public activityOverview: ActivityOverviewItem[];
  private referenceId: string;
  private tableAttributes: PaTableAttribute[];
  private tableAttributesToShow = [
    'namePartnerOrganization',
    'whatsappPhoneNumber',
  ];

  public loading = true;

  private canUpdatePaData: boolean;
  private canViewPersonalData: boolean;
  private canUpdatePersonalData: boolean;
  private canViewMessageHistory: boolean;
  private canViewPaymentData: boolean;
  private canViewVouchers: boolean;
  private canDoSinglePayment: boolean;

  private pubSubSubscription: Subscription;

  private PAYMENTS_TABLE_LENGTH = 4;

  public activityOverviewFilter: string = null;

  private statusDateKey = {
    imported: 'importedDate',
    invited: 'invitedDate',
    noLongerEligible: 'noLongerEligibleDate',
    startedRegistration: 'startedRegistrationDate',
    registered: 'registeredDate',
    registeredWhileNoLongerEligible: 'registeredWhileNoLongerEligibleDate',
    selectedForValidation: 'selectedForValidationDate',
    validated: 'validationDate',
    included: 'inclusionDate',
    inclusionEnded: 'inclusionEndDate',
    rejected: 'rejectionDate',
  };

  public activityOverviewButtons = [null, 'message', 'status', 'payment'];

  constructor(
    private route: ActivatedRoute,
    private programsService: ProgramsServiceApiService,
    private authService: AuthService,
    private translate: TranslateService,
    private modalController: ModalController,
    private pubSub: PubSubService,
    private translatableString: TranslatableStringService,
  ) {
    if (!this.pubSubSubscription) {
      this.pubSubSubscription = this.pubSub.subscribe(
        PubSubEvent.dataRegistrationChanged,
        async () => {
          this.loading = true;
          this.person = await this.loadPerson();
          this.fillPersonalInfoTable();
          this.fillPaymentsTable();
          this.fillActivityOverview();
          this.loading = false;
        },
      );
    }
  }

  async ngOnInit() {
    if (!this.programId || !this.paId) {
      this.loading = false;
      return;
    }

    this.program = await this.programsService.getProgramById(this.programId);

    this.tableAttributes = await this.programsService.getPaTableAttributes(
      this.programId,
      ProgramPhase.registrationValidation,
    );

    try {
      this.referenceId = (
        await this.programsService.getReferenceId(this.programId, this.paId)
      ).referenceId;
    } catch (error) {
      console.log(error);
      this.loading = false;
      return;
    }

    if (!this.referenceId || !this.program) {
      this.loading = false;
      return;
    }

    this.loadPermissions();

    this.person = await this.loadPerson();

    if (!this.person) {
      this.loading = false;
      return;
    }

    this.fillPersonalInfoTable();
    this.fillPaymentsTable();
    this.fillActivityOverview();

    this.loading = false;
  }

  ngOnDestroy(): void {
    if (this.pubSubSubscription) {
      this.pubSubSubscription.unsubscribe();
    }
  }

  private async loadPerson(): Promise<Person> {
    return (
      await this.programsService.getPeopleAffected(
        this.programId,
        this.canUpdatePersonalData,
        this.canViewPaymentData,
        this.referenceId,
      )
    )[0];
  }

  private fillPersonalInfoTable() {
    const translatePrefix = 'registration-details.personal-information-table.';

    const label = (key: string, interpolateParams?): string =>
      this.translate.instant(translatePrefix + key, interpolateParams);
    const dateString = (date: Date) => date.toLocaleString().split(',')[0];

    this.personalInfoTable = [
      {
        label: label('status', {
          status: this.translate.instant(
            'page.program.program-people-affected.status.' + this.person.status,
          ),
        }),
        value: dateString(this.getStatusDate(this.person.status)),
      },
      {
        label: label('primaryLanguage'),
        value: this.translate.instant(
          `page.program.program-people-affected.language.${this.person.preferredLanguage}`,
        ),
      },
      {
        label: label('phone'),
        value:
          this.person.phoneNumber === ''
            ? this.person.phoneNumber
            : `+${this.person.phoneNumber}`,
      },
    ];

    for (const ta of this.tableAttributes) {
      if (!this.tableAttributesToShow.includes(ta.name)) {
        continue;
      }

      const labelToTranslate = ta.shortLabel || ta.label;

      let value = this.person.paTableAttributes[ta.name].value;
      if (ta.type === 'tel') {
        value = value === '' ? value : `+${value}`;
      }

      this.personalInfoTable.push({
        label: this.translatableString.get(labelToTranslate),
        value,
      });
    }
  }

  private getStatusDate(status: string): Date {
    return new Date(this.person[this.statusDateKey[status]]);
  }

  private loadPermissions() {
    this.canUpdatePaData = this.authService.hasAllPermissions(this.programId, [
      Permission.RegistrationAttributeUPDATE,
    ]);
    this.canViewPersonalData = this.authService.hasAllPermissions(
      this.programId,
      [Permission.RegistrationPersonalREAD],
    );
    this.canUpdatePersonalData = this.authService.hasAllPermissions(
      this.programId,
      [Permission.RegistrationPersonalUPDATE],
    );
    this.canViewMessageHistory = this.authService.hasAllPermissions(
      this.programId,
      [Permission.RegistrationNotificationREAD],
    );
    this.canViewPaymentData = this.authService.hasAllPermissions(
      this.programId,
      [Permission.PaymentREAD, Permission.PaymentTransactionREAD],
    );
    this.canViewVouchers = this.authService.hasAllPermissions(this.programId, [
      Permission.PaymentVoucherREAD,
    ]);
    this.canDoSinglePayment = this.authService.hasAllPermissions(
      this.programId,
      [
        Permission.ActionREAD,
        Permission.PaymentCREATE,
        Permission.PaymentREAD,
        Permission.PaymentTransactionREAD,
      ],
    );
  }

  private async fillPaymentsTable() {
    this.paymentsTable = [];
    const minPayment = this.person.payment || 1;

    const payments = (
      await this.programsService.getTransactions(
        this.programId,
        minPayment,
        this.person?.referenceId,
      )
    ).slice(0, this.person.maxPayments || this.PAYMENTS_TABLE_LENGTH);

    const itemLabel = (paymentNumber) =>
      this.translate.instant(
        'registration-details.payment-overview.paymentLabel',
        {
          paymentNumber: paymentNumber,
        },
      );

    const itemValue = (status) =>
      this.translate.instant(
        'page.program.program-people-affected.transaction.' + status,
      );

    for (let i = 0; i < this.PAYMENTS_TABLE_LENGTH; i++) {
      let label: string;
      let value: string;
      if (!payments[i]) {
        const paymentNumber = minPayment + i;
        if (
          this.person.status !== RegistrationStatusEnum.included ||
          (this.person.maxPayments && paymentNumber > this.person.maxPayments)
        ) {
          break;
        }
        label = itemLabel(paymentNumber);
        value = itemValue('planned');
      } else {
        label = itemLabel(payments[i].payment);
        value = itemValue(payments[i].status);
      }

      this.paymentsTable.push({ label, value });
    }

    const itemPaymentNumber = (s) => Number(s.split('#')[1]);
    this.paymentsTable.sort(
      (a, b) => itemPaymentNumber(b.label) - itemPaymentNumber(a.label),
    );
  }

  public async editPersonAffectedPopup() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: EditPersonAffectedPopupComponent,
      componentProps: {
        person: this.person,
        programId: this.programId,
        readOnly: !this.canUpdatePaData,
        canViewPersonalData: this.canViewPersonalData,
        canUpdatePersonalData: this.canUpdatePersonalData,
        canViewMessageHistory: this.canViewMessageHistory,
        canViewPaymentData: this.canViewPaymentData,
      },
    });

    await modal.present();
  }

  public async paymentHistoryPopup() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: PaymentHistoryPopupComponent,
      componentProps: {
        person: this.person,
        programId: this.programId,
        program: this.program,
        readOnly: !this.canUpdatePaData,
        canViewPersonalData: this.canViewPersonalData,
        canUpdatePersonalData: this.canUpdatePersonalData,
        canDoSinglePayment: this.canDoSinglePayment,
        canViewVouchers: this.canViewVouchers,
      },
    });
    await modal.present();
  }

  private async fillActivityOverview() {
    this.activityOverview = [];

    const messageHistory = await this.programsService.retrieveMsgHistory(
      this.programId,
      this.referenceId,
    );

    for (const message of messageHistory) {
      this.activityOverview.push({
        type: ActivityOverviewType.message,
        label: 'Message',
        date: new Date(message.created),
        description: message.body,
      });
    }

    const payments = await this.programsService.getTransactions(
      this.programId,
      1,
      this.referenceId,
    );

    for (const payment of payments) {
      this.activityOverview.push({
        type: ActivityOverviewType.payment,
        label: `Payment #${payment.payment}`,
        date: new Date(payment.paymentDate),
        description: `Payment #${payment.payment} is ${this.translate.instant(
          'page.program.program-people-affected.transaction.' + payment.status,
        )}`,
      });
    }

    for (const statusDate of this.getStatusDateList()) {
      this.activityOverview.push({
        type: ActivityOverviewType.status,
        label: 'Status Update',
        date: statusDate.date,
        description: `Person affected status changed to ${this.translate.instant(
          'page.program.program-people-affected.status.' + statusDate.status,
        )}`,
      });
    }

    this.activityOverview.sort((a, b) => {
      if (b.date > a.date) {
        return 1;
      }
      return -1;
    });
  }

  public getIconName(type: ActivityOverviewType): string {
    const map = {
      [ActivityOverviewType.message]: 'mail-outline',
      [ActivityOverviewType.payment]: 'cash-outline',
      [ActivityOverviewType.status]: 'reload-circle-outline',
    };
    return map[type];
  }

  private getStatusDateList(): { status: string; date: Date }[] {
    const statusDates = [];
    for (const status of Object.keys(this.statusDateKey)) {
      const statusDateString = this.statusDateKey[status];
      if (this.person[statusDateString]) {
        statusDates.push({
          status,
          date: new Date(this.person[statusDateString]),
        });
      }
    }

    return statusDates;
  }

  public showPaymentInfo(): boolean {
    const acceptedStatuses = [
      RegistrationStatusEnum.included,
      RegistrationStatusEnum.completed,
      RegistrationStatusEnum.inclusionEnded,
      RegistrationStatusEnum.rejected,
    ];

    if (
      acceptedStatuses.includes(this.person.status) &&
      this.canViewPaymentData
    ) {
      return true;
    }

    return false;
  }

  public getFilteredActivityOverview(): ActivityOverviewItem[] {
    if (!this.activityOverviewFilter) {
      return this.activityOverview;
    }
    return this.activityOverview.filter(
      (item) => item.type === this.activityOverviewFilter,
    );
  }

  public getFilterCount(filter: string | null): number {
    if (!filter) {
      return this.activityOverview.length;
    }
    return this.activityOverview.filter((item) => item.type === filter).length;
  }
}
