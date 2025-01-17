import { HttpStatus } from '@nestjs/common';
import { RegistrationStatusEnum } from '../../src/registration/enum/registration-status.enum';
import { RegistrationEntity } from '../../src/registration/registration.entity';
import { DebugScope } from '../../src/scripts/enum/debug-scope.enum';
import { SeedScript } from '../../src/scripts/seed-script.enum';
import { ProgramPhase } from '../../src/shared/enum/program-phase.enum';
import {
  registrationScopedGoesPv,
  registrationScopedMiddelburgPv,
  registrationsPV,
} from '../fixtures/scoped-registrations';
import { changePhase } from '../helpers/program.helper';
import {
  awaitChangePaStatus,
  deleteRegistrations,
  importRegistrations,
} from '../helpers/registration.helper';
import {
  getAccessToken,
  getAccessTokenScoped,
  getServer,
  resetDB,
} from '../helpers/utility.helper';
import {
  programIdOCW,
  programIdPV,
  registrationsOCW,
} from '../registrations/pagination/pagination-data';

function createExportObject(
  registration: Partial<RegistrationEntity> | any,
): RegistrationEntity | any {
  const exportObject = {
    ...registration,
  };
  delete exportObject.fspName;
  // remove empty values
  Object.keys(exportObject).forEach(
    (key) => !exportObject[key] && delete exportObject[key],
  );
  return exportObject;
}

describe('Metric export list', () => {
  const OcwProgramId = programIdOCW;
  const PvProgramId = programIdPV;
  let accessToken: string;

  beforeAll(async () => {
    await resetDB(SeedScript.nlrcMultiple);
    accessToken = await getAccessToken();

    await changePhase(
      OcwProgramId,
      ProgramPhase.registrationValidation,
      accessToken,
    );

    await importRegistrations(OcwProgramId, registrationsOCW, accessToken);
    await deleteRegistrations(
      OcwProgramId,
      [registrationsOCW[0].referenceId],
      accessToken,
    );
    await awaitChangePaStatus(
      OcwProgramId,
      [registrationsOCW[1].referenceId],
      RegistrationStatusEnum.included,
      accessToken,
    );

    await importRegistrations(PvProgramId, registrationsPV, accessToken);
    await awaitChangePaStatus(
      PvProgramId,
      [registrationScopedMiddelburgPv.referenceId],
      RegistrationStatusEnum.included,
      accessToken,
    );
  });

  it('should export all people affected of a single program regardless of status', async () => {
    // Act
    const getRegistrationsResponse = await getServer()
      .get(`/programs/${OcwProgramId}/metrics/export-list/all-people-affected`)
      .set('Cookie', [accessToken])
      .send();

    // Assert
    const data = getRegistrationsResponse.body.data;
    expect(getRegistrationsResponse.status).toBe(HttpStatus.OK);
    expect(data.length).toBe(4);

    const expectedReferenceIds = registrationsOCW.map((r) => r.referenceId);

    // Also check if the right referenceIds are in the eport
    expect(data.map((r) => r.referenceId).sort()).toEqual(
      expectedReferenceIds.sort(),
    );

    for (const registration of registrationsOCW.slice(1)) {
      const exportRegistrationFound = data.find(
        (r) => r.referenceId === registration.referenceId,
      );
      expect(exportRegistrationFound).toMatchObject(
        createExportObject(registration),
      );
    }
  });

  it('should return all filtered registrations from 1 program using a filter for included and a scoped user', async () => {
    // Arrange
    const testScope = DebugScope.Zeeland;
    accessToken = await getAccessTokenScoped(testScope);

    // Act
    // 8 registrations in total are registered
    // 4 registrations are in include in program PV
    // 2 registrations of program PV and are in the scope (Zeeland) of the requesting user
    // 1 of those 2 registrations has status registered
    const getRegistrationsResponse = await getServer()
      .get(`/programs/${PvProgramId}/metrics/export-list/all-people-affected`)
      .set('Cookie', [accessToken])
      .query({
        ['filter.status']: `$ilike:registered`,
      })
      .send();

    // Assert
    const data = getRegistrationsResponse.body.data;
    expect(getRegistrationsResponse.status).toBe(HttpStatus.OK);
    expect(data.length).toBe(1);

    const exportRegistration = data[0];

    expect(exportRegistration).toMatchObject(
      createExportObject(registrationScopedGoesPv),
    );
  });
});
