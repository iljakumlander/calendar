import { Hash, EventId, Response } from './types';
import { Event } from './types';

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
