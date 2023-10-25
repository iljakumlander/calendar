import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { EventChangeArg, EventClickArg, EventRemoveArg, FormatDateOptions, formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import { contrastColor } from 'contrast-color';
import actionCreators from '../actions';
import { getHashValues } from '../utils';
import { EventAddArg } from '@fullcalendar/core';
import { Event, EventInfo, SelectInfo } from '../types';
import { CalendarProps, State, RangeApi, Input } from '../interfaces';
import Dialog from '../dialog';
import colors from '../../../colors.json';

function Calendar ({
    events,
    weekendsVisible,
    toggleWeekends,
    requestEvents,
    createEvent,
    updateEvent,
    deleteEvent,
}: CalendarProps): JSX.Element {
    const calendar = useRef<FullCalendar>(null);
    const [dialog, setDialog] = useState<JSX.Element | null>(null);
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

                                console.log('colors', colors, values.color?.trim());

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
                            caption: 'Delete',
                            callback: () => {
                                setDialog(
                                    <Dialog
                                        title='Delete event?'
                                        message={`Are you sure you want to delete '${clickInfo.event.title}' that runs from ${formatDate(clickInfo.event.startStr, formatDateConfig)} to ${formatDate(clickInfo.event.endStr, formatDateConfig)} event?`}
                                        prefer="reject"
                                        inputs={[]}
                                        autofocus={true}
                                        actions={
                                            {
                                                reject: {
                                                    type: 'reject',
                                                    caption: 'No',
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
                            caption: 'OK',
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
        requestEvents && requestEvents(rangeInfo.startStr, rangeInfo.endStr)
        .catch(reportNetworkError);
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
                headerToolbar={{
                    left: 'dayGridMonth,timeGridWeek,timeGridDay',
                    center: 'title',
                    right: 'prev,today,next',
                }}
                slotDuration="00:15:00"
                initialView='dayGridMonth'
                firstDay={1}
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
        weekendsVisible: state.weekendsVisible
      }
    }
  }
  
  export default connect(mapStateToProps, actionCreators)(Calendar);
