import * as request from 'supertest';
import { RegistrationStatusEnum } from '../../src/registration/enum/registration-status.enum';
import { getServer } from './utility.helper';

export function importRegistrations(
  programId: number,
  registrations: object[],
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post(`/programs/${programId}/registrations/import`)
    .set('Cookie', [accessToken])
    .send(registrations);
}

export function deleteRegistrations(
  programId: number,
  referenceIds: string[],
  accessToken: string,
  filter: { [key: string]: string } = {},
): Promise<request.Response> {
  const queryParams = {};
  if (referenceIds) {
    queryParams['filter.referenceId'] = `$in:${referenceIds.join(',')}`;
  }
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      queryParams[key] = value;
    }
  }

  return getServer()
    .del(`/programs/${programId}/registrations`)
    .set('Cookie', [accessToken])
    .send()
    .query(queryParams);
}

export function searchRegistrationByReferenceId(
  referenceId: string,
  programId: number,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .get(
      `/programs/${programId}/registrations/?referenceId=${referenceId}&paymentData=false&personalData=true`,
    )
    .set('Cookie', [accessToken]);
}

export function searchRegistrationByPhoneNumber(
  phoneNumber: string,
  accessToken: string,
): Promise<request.Response> {
  const queryParams = {
    phonenumber: phoneNumber,
  };
  return getServer()
    .get(`/registrations`)
    .query(queryParams)
    .set('Cookie', [accessToken]);
}

export function getRegistrations(
  programId: number,
  attributes: string[],
  accessToken: string,
  page?: number,
  limit?: number,
  filter: { [key: string]: string } = {},
  sort?: { field: string; direction: 'ASC' | 'DESC' },
): Promise<request.Response> {
  const queryParams = {};
  if (attributes) {
    queryParams['select'] = attributes.join(',');
  }
  if (page) {
    queryParams['page'] = String(page);
  }
  if (limit) {
    queryParams['limit'] = String(limit);
  }
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      queryParams[key] = value;
    }
  }
  if (sort) {
    queryParams['sortBy'] = `${sort.field}:${sort.direction}`;
  }
  return getServer()
    .get(`/programs/${programId}/registrations`)
    .query(queryParams)
    .set('Cookie', [accessToken]);
}

export function changePaStatus(
  programId: number,
  referenceIds: string[],
  status: RegistrationStatusEnum,
  accessToken: string,
  filter: { [key: string]: string } = {},
): Promise<request.Response> {
  const queryParams = {};
  if (referenceIds) {
    queryParams['filter.referenceId'] = `$in:${referenceIds.join(',')}`;
  }
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      queryParams[key] = value;
    }
  }
  return getServer()
    .patch(`/programs/${programId}/registrations/status`)
    .set('Cookie', [accessToken])
    .query(queryParams)
    .send({
      status: status,
      message: null,
    });
}

export function sendMessage(
  programId: number,
  referenceIds: string[],
  message: string,
  accessToken: string,
): Promise<request.Response> {
  const filter = {
    ['filter.referenceId']: `$in:${referenceIds.join(',')}`,
  };
  return getServer()
    .post(`/programs/${programId}/registrations/message`)
    .set('Cookie', [accessToken])
    .send({
      message: message,
    })
    .query(filter);
}

export function updateRegistration(
  programId: number,
  referenceId: string,
  data: object,
  reason: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .patch(`/programs/${programId}/registrations/${referenceId}`)
    .set('Cookie', [accessToken])
    .send({
      data: data,
      reason: reason,
    });
}

export function getRegistrationChangeLog(
  programId: number,
  referenceId: string,
  accessToken: string,
): Promise<request.Response> {
  const queryParams = {
    referenceId: referenceId,
  };
  return getServer()
    .get(`/programs/${programId}/registration-change-logs`)
    .query(queryParams)
    .set('Cookie', [accessToken]);
}

export function getVisaWalletsAndDetails(
  programId: number,
  referenceId: string,
  accessToken: string,
): Promise<request.Response> {
  const queryParams = {
    referenceId: referenceId,
  };
  return getServer()
    .get(
      `/programs/${programId}/financial-service-providers/intersolve-visa/wallets`,
    )
    .query(queryParams)
    .set('Cookie', [accessToken]);
}

export function issueNewVisaCard(
  programId: number,
  referenceId: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .put(
      `/programs/${programId}/financial-service-providers/intersolve-visa/customers/${referenceId}/wallets`,
    )
    .set('Cookie', [accessToken]);
}

export function blockVisaCard(
  programId: number,
  tokenCode: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post(
      `/programs/${programId}/financial-service-providers/intersolve-visa/wallets/${tokenCode}/block`,
    )
    .set('Cookie', [accessToken])
    .send({});
}

export function unblockVisaCard(
  programId: number,
  tokenCode: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .post(
      `/programs/${programId}/financial-service-providers/intersolve-visa/wallets/${tokenCode}/unblock`,
    )
    .set('Cookie', [accessToken])
    .send({});
}

export function getMessageHistory(
  programId: number,
  referenceId: string,
  accessToken: string,
): Promise<request.Response> {
  return getServer()
    .get(`/programs/${programId}/registrations/message-history/${referenceId}`)
    .set('Cookie', [accessToken]);
}
