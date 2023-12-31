import { Dictionary } from '@fullcalendar/core/internal';
import { Events, Event, Hash, RequestHandler, DialogActionType, Actions } from './types';

export interface CalendarProps {
    events: Events;
    weekendsVisible?: boolean;
    currentDate?: Date;
    currentView?: string;
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
    type?: string;
    label?: string;
    placeholder?: string;
    autofocus?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
    step?: number;
    maxlength?: number;
    minlength?: number;
    size?: number;
    multiple?: boolean;
    accept?: string;
    autocomplete?: string;
    checked?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    selected?: boolean;
    src?: string;
    alt?: string;
    height?: number;
    width?: number;
    cols?: number;
    rows?: number;
    wrap?: string;
    onChange?: React.ChangeEventHandler;
    options?: Array<{ value?: string, label?: string, selected?: boolean }>;
}


export interface Dialog {
  title?: string;
  message?: string;
  inputs: Array<Input>;
  actions?: Actions;
  prefer?: DialogActionType;
  autofocus?: boolean;
  className?: string;
  onDisplay?: (dialog: Dialog) => void;
}
