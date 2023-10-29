import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { EventChangeArg, EventClickArg, EventRemoveArg, FormatDateOptions, formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import { contrastColor } from 'contrast-color';
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

import actionCreators from '../actions';
import { getDateFromYearAndWeek, getHashValues, getUrlFromDate } from '../utils';
import { EventAddArg } from '@fullcalendar/core';
import { useParams, useNavigate } from 'react-router';
import { Event, EventInfo, SelectInfo, Values } from '../types';
import { CalendarProps, State, RangeApi } from '../interfaces';
import Dialog from '../dialog';
import colors from '../../../colors.json';

function Calendar ({
    events,
    weekendsVisible,
    requestEvents,
    createEvent,
    updateEvent,
    deleteEvent,
}: CalendarProps): JSX.Element {
    const calendar = useRef<FullCalendar>(null);
    const [dialog, setDialog] = useState<JSX.Element | null>(null);
    const { primary, secondary, tetriary, auxilary } = useParams<Values>();
    const navigate = useNavigate();
    const [range, setRange] = useState<{
        startStr: string,
        endStr: string,
    } | null>(null);
    const inRange = (start: Date = new Date(), end: Date = new Date(), date: Date = new Date()): boolean => date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
    const inRangeCurrent = (date: Date = new Date()): boolean => inRange(calendar.current?.getApi().view.activeStart, calendar.current?.getApi().view.activeEnd, date);

    function detect (primary: string | undefined, secondary: string | undefined, tetriary: string | undefined, auxilary: string | undefined): Current {
        if (!primary) {
            return {};
        }
        switch (primary) {
            case 'week':
            case 'weekly':
                return {
                    ...calculateWeek(parseInt(secondary || ''), parseInt(tetriary || '')),
                    view: 'timeGridWeek',
                }
        }

        return calculateDay(parseInt(primary), parseInt(secondary || ''), parseInt(tetriary || ''));
    }

    function calculateDay (year: number, month: number, day: number): Current {
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

    function calculateWeek (week: number, year: number): Current {
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

    type Current = {
        date?: Date,
        view?: string,
    }
    const [current, setCurrent] = useState<Current>(detect(primary, secondary, tetriary, auxilary));

    useEffect(() => {
        if (!range) {
            return;
        }

        requestEvents && requestEvents(range.startStr, range.endStr)
        .catch(reportNetworkError);
    }, [range]);

    useEffect(() => {
        setCurrent(detect(primary, secondary, tetriary, auxilary));
    }, [primary, secondary, tetriary, auxilary]);

    useEffect(() => {
        if (!calendar.current || !current.date || !current.view) {
            return;
        }

        if (current.date && current.view) {
            if (
                calendar.current?.getApi().view.type === current.view &&
                calendar.current?.getApi().getDate().getTime() === current.date.getTime()
            ) {
                return;
            }

            calendar.current?.getApi().changeView(current.view || 'dayGridMonth', current.date);
        }

        if (current.date && calendar.current?.getApi().view.type === current.view) {
            calendar.current?.getApi().getDate().getTime() !== current.date.getTime() && calendar.current?.getApi().gotoDate(current.date);

            return;
        }
    }, [current]);

    const formatDateConfig: FormatDateOptions = {
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
    };
    const renderEventContent = (eventInfo: EventInfo) => (
        <dl className="event">
            <dt className="event__time">{eventInfo.timeText.replace(' - ', '—')}</dt>
            <dd className="event__title">{eventInfo.event.title}</dd>
        </dl>
    );
    
    const handleDateSelect = (selectInfo: SelectInfo) => {
        const calendarApi = selectInfo.view.calendar;

        setDialog(
            <Dialog
                title='Create event'
                prefer="resolve"
                message={`${formatDate(selectInfo.startStr, formatDateConfig)}—${formatDate(selectInfo.endStr, formatDateConfig)}`}
                autofocus={true}
                inputs={[
                    {
                        name: 'title',
                        value: '',
                        title: 'Title',
                        required: true,
                    },
                    {
                        name: 'color',
                        value: '',
                        title: 'Color',
                        required: false,
                    },
                ]}
                actions={
                    {
                        dismiss: {
                            type: 'dismiss',
                            caption: 'Cancel',
                            callback: () => {
                                setDialog(null);
                            },
                        },
                        resolve: {
                            type: 'resolve',
                            caption: 'Create',
                            callback: (values) => {
                                if (!values || values.title.trim() === '') {
                                    return;
                                } 

                                calendarApi.addEvent({ // will render immediately. will call handleEventAdd
                                    title: values.title.trim(),
                                    start: selectInfo.startStr,
                                    end: selectInfo.endStr,
                                    allDay: selectInfo.allDay,
                                    ...(values.color && values.color.trim() && { backgroundColor: values.color.trim(), borderColor: values.color.trim(), textColor: contrastColor.call({}, { bgColor: values.color.trim(), customNamedColors: colors }) }),
                                }, true) // temporary=true, will get overwritten when reducer gives new events

                                setDialog(null);
                            },
                        }   
                    }
                }
            />
        );

        calendarApi.unselect();
    }
    
    const handleEventClick = (clickInfo: EventClickArg) => {
        const calendarApi = clickInfo.view.calendar;

        setDialog(
            <Dialog
                title='Edit event'
                message={`${formatDate(clickInfo.event.startStr, formatDateConfig)}—${formatDate(clickInfo.event.endStr, formatDateConfig)}`}
                prefer="resolve"
                autofocus={true}
                inputs={[
                    {
                        name: 'title',
                        value: clickInfo.event.title,
                        title: 'Title',
                        required: true,
                    },
                    {
                        name: 'color',
                        value: clickInfo.event.backgroundColor,
                        title: 'Background color',
                        required: false,
                    },
                ]}
                actions={
                    {
                        dismiss: {
                            type: 'dismiss',
                            caption: 'Cancel',
                            callback: () => {
                                setDialog(null);
                            },
                        },
                        resolve: {
                            type: 'resolve',
                            caption: 'Save',
                            callback: (values) => {
                                if (!values || values.title.trim() === '') {
                                    return;
                                }

                                clickInfo.event.setProp('title', values.title.trim());
                                if (values.color?.trim()) {
                                    clickInfo.event.setProp('backgroundColor', values.color.trim());
                                    clickInfo.event.setProp('borderColor', values.color.trim());
                                    clickInfo.event.setProp('textColor', contrastColor.call({}, { bgColor: values.color.trim(), customNamedColors: colors }));
                                }

                                setDialog(null);
                            },
                        },
                        diverge: {
                            type: 'diverge',
                            caption: 'Delete...',
                            callback: () => {
                                setDialog(
                                    <Dialog
                                        title='Delete event?'
                                        message={`Are you sure you want to delete '${clickInfo.event.title}' that runs from ${formatDate(clickInfo.event.startStr, formatDateConfig)} to ${formatDate(clickInfo.event.endStr, formatDateConfig)} event? There is no undo for this action.`}
                                        prefer="reject"
                                        inputs={[]}
                                        autofocus={true}
                                        actions={
                                            {
                                                reject: {
                                                    type: 'reject',
                                                    caption: 'Keep',
                                                    callback: () => {
                                                        setDialog(null);
                                                    },
                                                },
                                                resolve: {
                                                    type: 'resolve',
                                                    caption: 'Delete',
                                                    callback: (values) => {
                                                        clickInfo.event.remove(); // will render immediately. will call handleEventRemove

                                                        setDialog(null);
                                                    },
                                                },
                                            }
                                        }
                                    />
                                );
                            },
                        },
                    }
                }
            />
        );

        calendarApi.unselect();
    };

    const reportNetworkError = (): void => {
        setDialog(
            <Dialog
                title="Network error"
                message="Server action could not be completed or API out of reach."
                prefer="diverge"
                autofocus={true}
                inputs={[]}
                actions={
                    {
                        dismiss: {
                            type: 'dismiss',
                            caption: 'Dismiss',
                            callback: () => {
                                setDialog(null);
                            },
                        },
                        diverge: {
                            type: 'diverge',
                            caption: 'Refresh page',
                            callback: () => {
                                window.location.reload();

                                setDialog(null);
                            },
                        },
                    }
                }
            />
        );
    };

    const handleDates = (rangeInfo: RangeApi) => {
        // calendar.current?.getApi().view
        console.log('setting range >>', rangeInfo);
        setRange({
            startStr: rangeInfo.startStr,
            endStr: rangeInfo.endStr,
        });
    };
    
    const handleEventAdd = (addInfo: EventAddArg) => {
        createEvent && createEvent(addInfo.event.toPlainObject())
        .catch(() => {
            reportNetworkError()
            addInfo.revert()
        });
    };
    
    const handleEventChange = (changeInfo: EventChangeArg) => {
        updateEvent && updateEvent(changeInfo.event.toPlainObject())
        .catch(() => {
            reportNetworkError()
            changeInfo.revert()
        });
    };
    
    const handleEventRemove = (removeInfo: EventRemoveArg) => {
        deleteEvent && deleteEvent(removeInfo.event.id)
        .catch(() => {
            reportNetworkError()
            removeInfo.revert()
        });
    }

    return (
        <>
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
            <FullCalendar
                ref={calendar}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                customButtons= {
                    {
                        create: {
                            text: 'Add event',
                            click: () => {
                                calendar.current?.getApi().select(new Date());
                            }
                        }
                    }
                }
                headerToolbar={false}
                slotDuration="00:15:00"
                initialDate={current.date || new Date()}
                initialView={current.view || 'dayGridMonth'}
                slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false,
                }}
                firstDay={1}
                weekNumbers={true}
                weekNumberFormat={{
                    week: 'numeric',
                }}
                aspectRatio={3}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                navLinks={true}
                weekends={weekendsVisible}
                eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false,
                }}
                buttonIcons={{
                    today: 'today',
                }}
                buttonText={{
                    today: 'T',
                    month: 'M',
                    week: 'W',
                    day: 'D',
                    list: 'L',
                }}
                buttonHints={{
                    today: 'Today',
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    list: 'List',
                }}
                datesSet={handleDates}
                select={handleDateSelect}
                events={events}
                eventContent={renderEventContent} // custom render function
                eventClick={handleEventClick}
                eventAdd={handleEventAdd}
                eventChange={handleEventChange} // called for drag-n-drop/resize
                eventRemove={handleEventRemove}
                navLinkDayClick={function (date, jsEvent) {
                    navigate(getUrlFromDate(date, {
                        includeMonth: true,
                        includeDay: true,
                    }));
                    this.gotoDate(date);
                    this.changeView('timeGridDay');
                }}
                navLinkWeekClick={function (weekStart, jsEvent) {
                    navigate(getUrlFromDate(weekStart, {
                        displayWeek: true,
                    }));
                    this.gotoDate(weekStart);
                    this.changeView('timeGridWeek');
                }}
            />
            {dialog}
        </>
    );
}

function renderSidebarEvent (plainEventObject: Event): JSX.Element {
    return (
      <li key={plainEventObject.id}>
        <b>{formatDate(plainEventObject.start as string, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
        <i>{plainEventObject.title}</i>
      </li>
    )
  }
  
function mapStateToProps (): (state: State) => CalendarProps {
    const getEventArray = createSelector(
      (state: State) => state.eventsById,
      getHashValues
    );
  
    return (state: State) => {
      return {
        events: getEventArray(state),
        weekendsVisible: state.weekendsVisible,
      }
    }
  }
  
  export default connect(mapStateToProps, actionCreators)(Calendar);
