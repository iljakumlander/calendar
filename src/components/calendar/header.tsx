import React from 'react';

import Icon from '@mdi/react';

import {
    MemoryArrowRight as ArrowRightIcon,
    MemoryArrowLeft as ArrowLeftIcon,
} from '@pictogrammers/memory';

import {
    mdiCalendar as CalendarIcon,
    mdiCalendarWeek as CalendarWeekIcon,
    mdiCalendarMonth as CalendarMonthIcon,
    mdiCalendarToday as CalendarTodayIcon,
} from '@mdi/js';

import FullCalendar from '@fullcalendar/react';
import { getUrlFromDate } from '../utils';

const Header = (
    {
        calendar,
        navigate,
        inRangeCurrent,
    }: {
        calendar: React.MutableRefObject<FullCalendar | null>,
        navigate: (url: string) => void,
        inRangeCurrent: () => boolean,
    }
): JSX.Element => (
    <nav className="header bar">
        <div className="buttons bar -start">
            <button className={inRangeCurrent() ? '-active' : undefined} onClick={() => {
                switch (calendar.current?.getApi().view.type) {
                    case 'dayGridMonth':
                        navigate(getUrlFromDate(new Date(), {
                            includeMonth: true,
                        }));

                        break;

                    case 'timeGridWeek':
                        navigate(getUrlFromDate(new Date(), {
                            displayWeek: true,
                        }));

                        break;

                    case 'timeGridDay':
                        navigate(getUrlFromDate(new Date(), {
                            includeDay: true,
                            includeMonth: true,
                        }));

                        break;
                }
            }} title="Today">
                <Icon path={CalendarTodayIcon}
                    title="Calendar today"
                    size="24px"
                />
            </button>
            <div className="group buttons">
                <button onClick={() => {
                    switch (calendar.current?.getApi().view.type) {
                        case 'dayGridMonth':
                            navigate(getUrlFromDate(calendar.current?.getApi().getDate(), {
                                includeMonth: true,
                                monthsToAdd: -1,
                            }));

                            break;

                        case 'timeGridWeek':
                            navigate(getUrlFromDate(calendar.current?.getApi().getDate(), {
                                displayWeek: true,
                                weeksToAdd: -1,
                            }));

                            break;

                        case 'timeGridDay':
                            navigate(getUrlFromDate(calendar.current?.getApi().getDate(), {
                                includeDay: true,
                                includeMonth: true,
                                daysToAdd: -1,
                            }));

                            break;
                    }
                }} title="Previous">
                    <Icon path={ArrowLeftIcon}
                        title="Arrow Left"
                        size="24px"
                        horizontal
                        vertical
                        rotate={180}
                    />
                </button>
                
                <button onClick={() => {
                    switch (calendar.current?.getApi().view.type) {
                        case 'dayGridMonth':
                            navigate(getUrlFromDate(calendar.current?.getApi().getDate(), {
                                includeMonth: true,
                                monthsToAdd: 1,
                            }));

                            break;

                        case 'timeGridWeek':
                            navigate(getUrlFromDate(calendar.current?.getApi().getDate(), {
                                displayWeek: true,
                                weeksToAdd: 1,
                            }));

                            break;

                        case 'timeGridDay':
                            navigate(getUrlFromDate(calendar.current?.getApi().getDate(), {
                                includeDay: true,
                                includeMonth: true,
                                daysToAdd: 1,
                            }));

                            break;
                    }
                }} title="Next">
                    <Icon path={ArrowRightIcon}
                        title="Arrow Right"
                        size="24px"
                        horizontal
                        vertical
                        rotate={180}
                    />
                </button>
            </div>
        </div>
        <div className="group buttons -end">
            <button className={calendar.current?.getApi().view.type === 'dayGridMonth' ? '-active' : undefined} onClick={() => {
                navigate(getUrlFromDate(calendar.current?.getApi().getDate() || new Date(), {
                    includeDay: false,
                    includeMonth: true,
                }));
            }
            } title="Month">
                <Icon path={CalendarMonthIcon}
                    title="Calendar month"
                    size="24px"
                    horizontal
                    vertical
                    rotate={180}
                />
            </button>
            <button className={calendar.current?.getApi().view.type === 'timeGridWeek' ? '-active' : undefined} onClick={() => {
                navigate(getUrlFromDate(inRangeCurrent() ? new Date() : calendar.current?.getApi().getDate() || new Date(), {
                    displayWeek: true,
                }));
            }
            } title="Week">
                <Icon path={CalendarWeekIcon}
                    title="Calendar week"
                    size="24px"
                    horizontal
                    vertical
                    rotate={180}
                />
            </button>
            <button className={calendar.current?.getApi().view.type === 'timeGridDay' ? '-active' : undefined} onClick={() => {
                navigate(getUrlFromDate(calendar.current?.getApi().view.type === 'dayGridMonth' && inRangeCurrent() ? new Date() : calendar.current?.getApi().getDate() || new Date(), {
                    includeDay: true,
                    includeMonth: true,
                }));
            }
            } title="Day">
                <Icon path={CalendarIcon}
                    title="Calendar day"
                    size="24px"
                    horizontal
                    vertical
                    rotate={180}
                />
            </button>
        </div>
        <div className="group heading -center">
            <h1>{calendar.current?.getApi().view.title}</h1>
        </div>
    </nav>
);

export default Header;
