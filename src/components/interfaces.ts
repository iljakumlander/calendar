import { Dictionary } from '@fullcalendar/core/internal';
import { Events, Event, Hash, RequestHandler, DialogActionType, Actions } from './types';
import { ReactNode } from 'react';

export interface CalendarProps {
    events: Events;
    weekendsVisible?: boolean;
    toggleWeekends?: () => void;
    requestEvents?: (start: string, end: string) => Promise<void>;
    createEvent?: (event: Dictionary) => Promise<void>;
    updateEvent?: (event: Dictionary) => Promise<void>;
    deleteEvent?: (id: string) => Promise<void>;
    eventsById?: Hash<Event>;
}

export interface RangeApi {
    start: Date;
    end: Date;
    startStr: string;
    endStr: string;
}

export interface State extends CalendarProps {
    weekendsVisible: boolean;
    currentEvents: Events;
    eventsById: Hash<Event>;
}

export interface ParsedRequest {
    path: string;
    queryParams: { [key: string]: string | string[] };
    pathParams: { [key: string]: string };
    method: string;
}

export interface Params {
    [key: string]: string | number | Date;
}
  
export interface Route {
    pattern: RegExp;
    keys: string[];
    method: string;
    handler: RequestHandler;
}

export interface Input {
    name: string;
    value: string;
    title?: string;
    required?: boolean;
}


export interface Dialog {
  title?: string;
  message?: string;
  inputs: Array<Input>;
  actions?: Actions;
  prefer?: DialogActionType;
  autofocus?: boolean;
}
