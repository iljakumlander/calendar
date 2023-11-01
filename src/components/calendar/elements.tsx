import React from 'react';

import { formatDate } from '@fullcalendar/core';
import { Event, EventInfo } from '../types';

export const renderSidebarEvent = (event: Event): JSX.Element => (
    <li key={event.id}>
        <b>{formatDate(event.start as string, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
        <i>{event.title}</i>
    </li>
);

export const renderEventContent = (eventInfo: EventInfo): JSX.Element => (
    <dl className="event">
        <dt className="event__time">{eventInfo.timeText.replace(' - ', '—')}</dt>
        <dd className="event__title">{eventInfo.event.title}</dd>
    </dl>
);
