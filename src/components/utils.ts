import { Hash, EventId, Response, Current } from './types';
import { Event } from './types';
import moment from 'moment';

export const uuid = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
export const getHashValues = (hash: Hash<Event>) => Object.values(hash);
export const excludeById = (events: Event[], id: EventId) => events.filter((event) => event.id !== id);
export const getTodayStr = () => new Date().toISOString().replace(/T.*$/, '');
export const inRange = (start: Date = new Date(), end: Date = new Date(), date: Date = new Date()): boolean => date.getTime() >= start.getTime() && date.getTime() <= end.getTime();

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

/**
 * Regular expression breakdown
 * ^ - start of the string
 * @? - matches 0 or 1 '@' symbol
 * ([01]?[0-9]|2[0-3]) - matches 0-23 for hours
 * ([.:]?|(?=[0-5])) - matches 0 or 1 occurrence of ':' or '.', or looks ahead to match the range [0-5]
 * [0-5][0-9] - matches 00-59 for minutes
 * $ - end of the string
 * @param input string to test
 * @returns 
 */
export const isValidTime = (input: string): boolean => /^@?([01]?[0-9]|2[0-3])([.:]?|(?=[0-5]))[0-5][0-9]$/.test(input);

const isValidHour = (hour: string): boolean => Number(hour) >= 0 && Number(hour) <= 23;
const formatTime = (hour: string, minutes: string): string => `${hour.padStart(2, '0')}:${minutes}`;

export function decodeTime (input: string): string | null {
  const components = extractTimeComponents(input);
  if (!components) return null;

  const [hour, minutes] = components;
  if (!isValidHour(hour)) return null;

  return formatTime(hour, minutes);
}

function extractTimeComponents (input: string): [string, string] | null {
  const result = /^@?(\d{1,2})[.:]?(\d{2})?$/.exec(input);
  
  if (!result) {
    return null;
  }

  const hour = result[1];
  const minutes = result[2] || hour.slice(-2);

  return [hour.length > 2 ? hour.slice(0, -2) : hour, minutes];
}


export function detect (primary: string | undefined, secondary: string | undefined, tetriary: string | undefined, auxilary: string | undefined): Current {
  if (!primary) {
      return {};
  }

  switch (primary) {
      case 'week':
      case 'weekly':
          return {
              ...calculateWeek(parseInt(secondary || ''), parseInt(tetriary || '')),
              view: 'timeGridWeek',
              ...(auxilary && { time: decodeTime(auxilary) || undefined }),
          }
  }

  return {
      ...calculateDay(parseInt(primary), parseInt(secondary || ''), parseInt(tetriary || '')),
      ...(auxilary && { time: decodeTime(auxilary) || undefined }),
  };
}

export function calculateDay (year: number, month: number, day: number): Current {
  if (isNaN(year)) {
      return {};
  }

  if (isNaN(month)) {
      return {
          date: new Date(year, 0, 1),
          view: 'dayGridMonth',
      }
  }
  
  if (isNaN(day)) {
      return {
          date: new Date(year, month - 1, 1),
          view: 'dayGridMonth',
      }
  }

  return {
      date: new Date(year, month - 1, day),
      view: 'timeGridDay',
  }
}

export function calculateWeek (week: number, year: number): Current {
  if (isNaN(week)) {
      return {
          date: new Date(),
      }
  }

  if (isNaN(year)) {
      return {
          date: getDateFromYearAndWeek(new Date().getFullYear(), week),
      };
  }

  return {
      date: getDateFromYearAndWeek(year, week),
  }
}
