import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { EventChangeArg, EventClickArg, EventRemoveArg, FormatDateOptions, formatDate } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // needed for dayClick
import actionCreators from '../actions';
import { getHashValues } from '../utils';
import { EventAddArg } from '@fullcalendar/core';
import { Event, EventInfo, SelectInfo } from '../types';
import { CalendarProps, State, RangeApi, Input } from '../interfaces';
import Dialog from '../dialog';

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
        <>
            <b>{eventInfo.timeText}</b>
            <i>{eventInfo.event.title}</i>
        </>
    );
    
    const handleDateSelect = (selectInfo: SelectInfo) => {
        const calendarApi = selectInfo.view.calendar;

        setDialog(
            <Dialog
                title='Add event'
                prefer="resolve"
                message={`${formatDate(selectInfo.startStr, formatDateConfig)}—${formatDate(selectInfo.endStr, formatDateConfig)}`}
                autofocus={true}
                inputs={[
                    {
                        name: 'title',
                        value: '',
                        title: 'Title',
                        required: true,
                    }
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
                            caption: 'OK',
                            callback: (values) => {
                                if (!values || values.title.trim() === '') {
                                    return;
                                } 

                                calendarApi.addEvent({ // will render immediately. will call handleEventAdd
                                    title: values.title,
                                    start: selectInfo.startStr,
                                    end: selectInfo.endStr,
                                    allDay: selectInfo.allDay
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
                    }
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
                    left: 'create',
                    center: 'title',
                    right: 'prev,next',
                }}
                footerToolbar={{
                    left: 'dayGridMonth,timeGridWeek,timeGridDay',
                    right: 'today',
                }}
                initialView='dayGridMonth'
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={weekendsVisible}
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
  
function reportNetworkError (): void {
    alert('This action could not be completed')
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
