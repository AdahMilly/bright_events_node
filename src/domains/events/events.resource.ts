import * as knex from 'knex';
import { knexInstance } from '../../database/knexInstance';
import {
  EventBody,
  RawEventBody,
  EventLookUpKey,
  UpdateEventBody,
  EventsFilter,
  EventsFilterFields,
  QueryBuilderFunction,
} from './events.types';
import { EventNotFountError } from './events.errors';
import { pipe } from '../../lib/util/functionalUtils';

const EVENTS_TABLE = 'events';
const RSVPS_TABLE = 'rsvps';
const ACCOUNTS_TABLE = 'accounts';

interface EventsResource {
  create(eventBody: EventBody): Promise<Readonly<RawEventBody>>;
  getEvent(lookupKey: EventLookUpKey, value: string): Promise<Readonly<RawEventBody>>;
  filterEvents(filterBody: EventsFilter): Promise<Readonly<RawEventBody[]>>;
  getAll(offset: number, limit: number): Promise<Readonly<RawEventBody[]>>;
  update(updateBody: UpdateEventBody, eventId: string): Promise<Readonly<RawEventBody>>;
  delete(eventId: string): Promise<void>;
  getAttendees(eventId: string): Promise<Readonly<any>>;
}

class EventsResourceImplementation implements EventsResource {

  private documentVector(queryString: string): QueryBuilderFunction {
    return (query: knex.QueryBuilder): knex.QueryBuilder =>
      query.whereRaw(`document @@ to_tsquery('${ queryString }')`);
  }

  private filterbyField(field: EventsFilterFields, value: string): QueryBuilderFunction {
    return (query: knex.QueryBuilder): knex.QueryBuilder => query.where(field, value);
  }

  private filterByDateEqualTo(dateField: string, date: string): QueryBuilderFunction {
    return (query: knex.QueryBuilder): knex.QueryBuilder => query.where(dateField, date);
  }

  private getQueryBuilderFunctions(filterBody: EventsFilter): QueryBuilderFunction[] {
    const filterQueryFunctions = [];
    // const {
      // rsvpEndDate,
      // rsvpEndDateGreaterThan,
      // rsvpEndDateGreaterThanEqualTo,
      // rsvpEndDateLessThan,
      // rsvpEndDateLessThanEqualTo,
    // } = filterBody;

    if (filterBody.location) {
      filterQueryFunctions.push(this.filterbyField(EventsFilterFields.LOCATION, filterBody.location));
    }

    if(filterBody.title) {
      filterQueryFunctions.push(this.filterbyField(EventsFilterFields.TITLE, filterBody.title));
    }

    if(filterBody.date) {
      filterQueryFunctions.push(this.filterByDateEqualTo('date', filterBody.date));
    }

    if(filterBody.rsvpEndDate) {
      filterQueryFunctions.push(this.filterByDateEqualTo('rsvpEndDate', filterBody.date));
    }

    if(filterBody.q) {
      filterQueryFunctions.push(this.documentVector(filterBody.q));
    }

    return filterQueryFunctions;
  }

  public async create(eventBody: EventBody): Promise<Readonly<RawEventBody>> {
    const created = await knexInstance<RawEventBody>(EVENTS_TABLE)
      .insert(eventBody, '*');
    return created[0];
  }

  public async getEvent(lookupKey: EventLookUpKey, value: string): Promise<Readonly<RawEventBody>> {
    const event = knexInstance<RawEventBody>(EVENTS_TABLE)
      .where(lookupKey, value)
      .first();

    if(!event) {
      throw new EventNotFountError(`no event with ${lookupKey} ${value} found`);
    }
    return event;
  }

  public async filterEvents(filterBody: EventsFilter): Promise<Readonly<RawEventBody[]>> {
    const baseQuey = knexInstance(EVENTS_TABLE);
    const queryBuilderFunctions = this.getQueryBuilderFunctions(filterBody);
    const  queryBuilder = pipe<knex.QueryBuilder>(...queryBuilderFunctions);
    const query = queryBuilder(baseQuey);
    return await query;
  }

  public async getAll(offset: number, limit: number): Promise<Readonly<RawEventBody[]>> {
    const events = await knexInstance<RawEventBody>(EVENTS_TABLE)
      .select('*')
      .offset(offset)
      .limit(limit);

    if(!events.length) {
      throw new EventNotFountError('no events found that match your query', 404);
    }

    return events;
  }

  public async update(updateBody: UpdateEventBody, eventId: string): Promise<Readonly<RawEventBody>> {
    const updatedEvent = await knexInstance<RawEventBody>(EVENTS_TABLE)
      .update(updateBody)
      .where('id', eventId)
      .returning('*');

    return updatedEvent[0];
  }

  public async delete(eventId: string): Promise<void> {
    await knexInstance<RawEventBody>(EVENTS_TABLE)
      .delete()
      .where('id', eventId);
  }

  public async getAttendees(eventId: string): Promise<Readonly<any>> {
    const attendees= await knexInstance(RSVPS_TABLE)
      .select('*')
      .innerJoin(ACCOUNTS_TABLE, `${ACCOUNTS_TABLE}.id`, `${RSVPS_TABLE}.account_id`)
      .where(`${RSVPS_TABLE}.event_id`, eventId);
    return attendees;
  }
}

export const EventsResource: EventsResource = new EventsResourceImplementation();
