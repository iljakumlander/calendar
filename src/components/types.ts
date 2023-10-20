import { EventApi, EventInput, EventSourceInput, ViewApi } from '@fullcalendar/core';
import { Dictionary } from '@fullcalendar/core/internal';
import http from 'http';
import { Input } from './interfaces';

export type EventId = string;

export type EventType = {
    id: EventId;
    extendedProps: Dictionary;
    start: string;
    end: string;
    date: string;
    allDay: boolean;
    groupId: string;
    title: string;
    url: string;
    interactive: boolean;
};

export type Event = (Partial<EventApi> | Partial<EventType>) & {
    id: EventId;
    start: Date;
    end: Date;
    title: string;
    allDay: boolean;
};

export type Events = Event[] & Partial<EventInput> & Partial<EventSourceInput>;

export type TOGGLE_WEEKENDS = 'TOGGLE_WEEKENDS';
export type RECEIVE_EVENTS = 'RECEIVE_EVENTS';
export type CREATE_EVENT = 'CREATE_EVENT';
export type UPDATE_EVENT = 'UPDATE_EVENT';
export type DELETE_EVENT = 'DELETE_EVENT';

export type ActionType = TOGGLE_WEEKENDS | RECEIVE_EVENTS | CREATE_EVENT | UPDATE_EVENT | DELETE_EVENT;

export type ActionCommon = {
    type: ActionType;
}

export type ActionConditional = {
  type: TOGGLE_WEEKENDS;
} | {
  type: RECEIVE_EVENTS;
  plainEventObjects: Event[];
} | {
  type: CREATE_EVENT;
  plainEventObject: Event;
} | {
  type: UPDATE_EVENT;
  plainEventObject: Event;
} | {
  type: DELETE_EVENT;
  eventId: EventId;
};

export type Hash<T> = { [id: string]: T };

export type Action = ActionCommon & ActionConditional;

export type Dispatch = (action: Action) => void;

export type EventInfo = {
    timeText: string;
    event: Event;
}

export type ViewInfo = {
    calendar: any;
}

export type SelectInfo = {
    view: ViewApi;
    startStr: string;
    endStr: string;
    allDay: boolean;
}

export type Response = {
    status?: string;
    reason?: string;
    code?: number;
    message?: string;
    details?: string;
};

export type RequestHandler = (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    params: {
        [key: string]: string
    },
) => void;

export type DialogCallback = (inputs: Values) => void;

export type DialogActionType = 'dismiss' | 'resolve' | 'reject' | 'diverge';

export type DialogAction = {
  type: DialogActionType;
  caption: string;
  callback: DialogCallback;
}

export type Actions = {
  [key in DialogActionType]?: DialogAction;
};

export type Values = {
  [key: string]: string;
};
