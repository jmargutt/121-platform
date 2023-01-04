import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ActionType } from '../models/actions.model';
import { ExportType } from '../models/export-type.model';
import { ProgramsServiceApiService } from './programs-service-api.service';

@Injectable({
  providedIn: 'root',
})
export class LatestActionService {
  private locale: string;
  private dateFormat = 'yyyy-MM-dd, HH:mm';
  constructor(private programsService: ProgramsServiceApiService) {
    this.locale = environment.defaultLocale;
  }

  public async getLatestActionTime(
    actionType: ActionType | ExportType,
    programId: number,
  ): Promise<string | null> {
    const latestAction = await this.programsService.retrieveLatestActions(
      actionType,
      programId,
    );
    if (!latestAction) {
      return null;
    }
    return formatDate(
      new Date(latestAction.created),
      this.dateFormat,
      this.locale,
    );
  }
}