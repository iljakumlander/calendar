import { Hash, EventId, Response } from './types';
import { Event } from './types';
import moment from 'moment';

export const uuid = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
export const getHashValues = (hash: Hash<Event>) => Object.values(hash);
export const excludeById = (events: Event[], id: EventId) => events.filter((event) => event.id !== id);
export const getTodayStr = () => new Date().toISOString().replace(/T.*$/, '');

export function hashById (events: Event[]): Hash<Event> {
    const hash: Hash<Event> = {};
  
    for (let event of events) {
      hash[event.id] = event;
    }
  
    return hash;
}

export function isResponse(obj: any): obj is Response {
  return obj && (obj.hasOwnProperty('status') || obj.hasOwnProperty('reason') || obj.hasOwnProperty('code') || obj.hasOwnProperty('message') || obj.hasOwnProperty('details'));
}

export function getDateFromYearAndWeek (year: number, weekNumber: number) {
  return moment().year(year).isoWeek(weekNumber).toDate();
}

export function getWeekNumber (date: Date): [number, number] {
  return [moment(date).isoWeek(), moment(date).isoWeekYear()];
}

export function getWeek (date: Date): number {
  const copy: Date = new Date(date.getTime());

  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + 3 - (copy.getDay() + 6) % 7);

  const week1 = new Date(copy.getFullYear(), 0, 4);

  return 1 + Math.round(((copy.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export function getUrlFromDate (date: Date, options?: { includeMonth?: boolean, includeDay?: boolean, displayWeek?: boolean, daysToAdd?: number, weeksToAdd?: number, monthsToAdd?: number; yearsToAdd?: number }): string {
  const shifted = new Date(date.getTime());

  if (options?.weeksToAdd || options?.displayWeek) {
    shifted.setDate(date.getDate() + ((options.weeksToAdd || 0) * 7));

    return `/week/${getWeek(shifted)}/${shifted.getFullYear()}/`;
  }

  if (options?.yearsToAdd) {
    shifted.setFullYear(shifted.getFullYear() + options.yearsToAdd);
  }

  if (options?.monthsToAdd) {
    shifted.setMonth(shifted.getMonth() + options.monthsToAdd);
  }

  if (options?.daysToAdd) {
    shifted.setDate(shifted.getDate() + options.daysToAdd);
  }

  const year = shifted.getFullYear();
  const month = options?.includeMonth ? shifted.getMonth() + 1 : undefined;
  const day = options?.includeDay ? shifted.getDate() : undefined;

  return `/${[
    year.toString(),
    month && month.toString().padStart(2, '0'),
    day && day.toString().padStart(2, '0'),
  ].filter(item => typeof item !== 'undefined').join('/')}/`
}
