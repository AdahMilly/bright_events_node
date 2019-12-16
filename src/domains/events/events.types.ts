import * as knex from 'knex';

export interface EventBody {
  tittle: string;
  slug: string;
  description: string;
  location: string;
  date: string;
  time: string;
  rsvpEndDate: string;
  createdBy: string;
}

export interface RawEventBody extends EventBody {
  id: string;
}

export enum EventLookUpKey {
  ID = 'id',
  SLUG = 'slug',
}

export interface UpdateEventBody {
  tittle?: string;
  slug?: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  rsvpEndDate?: string;
  createdBy?: string;
}

export interface EventsFilter {
  tittle?: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  rsvpEndDate?: string;
  createdBy?: string;

  dateGreaterThan?: string;
  dateGreaterThanEqualTo?: string;
  dateLessThan?: string;
  dateLessThanEqualTo?: string;

  rsvpEndDateGreaterThan?: string;
  rsvpEndDateGreaterThanEqualTo?: string;
  rsvpEndDateLessThan?: string;
  rsvpEndDateLessThanEqualTo?: string;
}

export enum EventsFilterFields {
  TITTLE = 'tittle',
  DESCRIPTION = 'description',
  LOCATION = 'location',
}

export type QueryBuilderFunction = (query: knex.QueryBuilder) => knex.QueryBuilder;
