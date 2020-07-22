import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ExportType } from '../models/export-type.model';
import { NotificationType } from '../models/notification-type.model';
import { PastInstallments } from '../models/past-installments.model';
import { Person } from '../models/person.model';
import { ProgramMetrics } from '../models/program-metrics.model';
import { Program } from '../models/program.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramsServiceApiService {
  constructor(private apiService: ApiService) {}

  login(email: string, password: string): Observable<any> {
    console.log('ProgramsService : login()');

    return this.apiService.post(
      environment.url_121_service_api,
      '/user/login',
      {
        email,
        password,
      },
      true,
    );
  }

  deleteUser(userId: string): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, '/user/delete/' + userId, {})
      .toPromise();
  }

  getAllPrograms(): Promise<Program[]> {
    return this.apiService
      .get(environment.url_121_service_api, '/programs')
      .pipe(
        map((response) => {
          return response.programs;
        }),
      )
      .toPromise();
  }

  getProgramById(programId: number | string): Promise<Program> {
    return this.apiService
      .get(environment.url_121_service_api, `/programs/${programId}`)
      .toPromise();
  }

  advancePhase(programId: number, newState: string): Promise<any> {
    return this.apiService
      .post(
        environment.url_121_service_api,
        `/programs/changeState/` + programId,
        {
          newState,
        },
      )
      .toPromise();
  }

  getMetricsById(programId: number | string): Promise<ProgramMetrics> {
    return this.apiService
      .get(environment.url_121_service_api, `/programs/metrics/${programId}`)
      .toPromise();
  }

  getTotalIncluded(programId: number | string): Promise<number> {
    return this.apiService
      .get(
        environment.url_121_service_api,
        `/programs/total-included/${programId}`,
      )
      .toPromise();
  }

  getPastInstallments(programId: number | string): Promise<PastInstallments[]> {
    return this.apiService
      .get(
        environment.url_121_service_api,
        `/programs/installments/${programId}`,
      )
      .toPromise();
  }

  getTransactions(programId: number | string): Promise<any[]> {
    return this.apiService
      .get(
        environment.url_121_service_api,
        `/programs/transactions/${programId}`,
      )
      .toPromise();
  }

  submitPayout(
    programId: number,
    installment: number,
    amount: number,
  ): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/programs/payout`, {
        programId,
        installment,
        amount,
      })
      .toPromise();
  }

  exportPaymentList(programId: number, installment: number): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/programs/payment-details`, {
        programId,
        installment,
      })
      .toPromise();
  }

  exportList(
    programId: number,
    type: ExportType,
    installment?: number,
  ): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/programs/export-list`, {
        programId,
        type,
        installment,
      })
      .toPromise();
  }

  getPeopleAffected(programId: number | string): Promise<Person[]> {
    return this.apiService
      .get(environment.url_121_service_api, `/programs/enrolled/${programId}`)
      .toPromise();
  }

  getPeopleAffectedPrivacy(programId: number | string): Promise<Person[]> {
    return this.apiService
      .get(
        environment.url_121_service_api,
        `/programs/enrolledPrivacy/${programId}`,
      )
      .toPromise();
  }

  selectForValidation(
    programId: number | string,
    dids: string[],
  ): Promise<any> {
    return this.apiService
      .post(
        environment.url_121_service_api,
        `/programs/select-validation/${programId}`,
        {
          dids: JSON.stringify(dids),
        },
      )
      .toPromise();
  }

  include(programId: number | string, dids: string[]): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/programs/include/${programId}`, {
        dids: JSON.stringify(dids),
      })
      .toPromise();
  }

  reject(programId: number | string, dids: string[]): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/programs/reject/${programId}`, {
        dids: JSON.stringify(dids),
      })
      .toPromise();
  }

  notify(
    programId: number | string,
    notificationType: NotificationType,
  ): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/programs/notify`, {
        programId,
        notificationType,
      })
      .toPromise();
  }

  saveAction(actionType: ActionType, programId: number | string): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/actions/save`, {
        actionType,
        programId,
      })
      .toPromise();
  }
  addUser(
    email: string,
    password: string,
    role: string,
    status: string,
    countryId: number,
  ): Promise<any> {
    return this.apiService
      .post(environment.url_121_service_api, `/user`, {
        email,
        password,
        role,
        status,
        countryId,
      })
      .toPromise();
  }

  assignAidworker(
    programId: number | string,
    userId: number,
  ): Promise<Program> {
    return this.apiService
      .post(environment.url_121_service_api, `/user/${userId}/${programId}`, {})
      .toPromise();
  }
}
