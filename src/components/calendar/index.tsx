import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useParams, useNavigate } from 'react-router';
import FullCalendar from '@fullcalendar/react';
import { EventAddArg, EventChangeArg, EventClickArg, EventRemoveArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { contrastColor } from 'contrast-color';

import actionCreators from '../actions';
import { Current, SelectInfo, Values, Range } from '../types';
import { CalendarProps, RangeApi } from '../interfaces';
import { detect, getUrlFromDate, inRange } from '../utils';
import { mapStateToProps } from './helpers';

import Header from './header';
import Create from './dialogues/event/create';
import Edit from './dialogues/event/edit';
import Delete from './dialogues/event/delete';
import Network from './dialogues/errors/network';

import { renderEventContent } from './elements';

import colors from '../../../colors.json';

function Calendar ({
    events,
    weekendsVisible,
    requestEvents,
    createEvent,
    updateEvent,
    deleteEvent,
}: CalendarProps
): JSX.Element {
    const calendar = useRef<FullCalendar>(null);
    const { primary, secondary, tetriary, auxilary } = useParams<Values>();
    const [current, setCurrent] = useState<Current>(detect(primary, secondary, tetriary, auxilary));
    const [dialog, setDialog] = useState<JSX.Element | null>(null);
    const [range, setRange] = useState<Range | null>(null);
    const navigate = useNavigate();
    
    const inRangeCurrent = (date: Date = new Date()): boolean => inRange(calendar.current?.getApi().view.activeStart, calendar.current?.getApi().view.activeEnd, date);
    
    const handleDateSelect = (selectInfo: SelectInfo) => (
        setDialog(
            <Create
                selectInfo={selectInfo}
                colors={colors}
                dismiss={() => {
                    setDialog(null);
                }}
                resolve={(values: Values) => {
                    if (!values || values.title.trim() === '') {
                        return;
                    } 

                    selectInfo.view.calendar.addEvent({ // will render immediately. will call handleEventAdd
                        title: values.title.trim(),
                        start: selectInfo.startStr,
                        end: selectInfo.endStr,
                        allDay: selectInfo.allDay,
                        ...(values.color && values.color.trim() && { backgroundColor: values.color.trim(), borderColor: values.color.trim(), textColor: contrastColor.call({}, { bgColor: values.color.trim(), customNamedColors: colors }) }),
                    }, true) // temporary=true, will get overwritten when reducer gives new events

                    setDialog(null);
                }}
            />
        ),
        selectInfo.view.calendar.unselect()
    );
    
    const handleEventClick = (clickInfo: EventClickArg) => (
        setDialog(
            <Edit
                clickInfo={clickInfo}
                colors={colors}
                dismiss={() => {
                    setDialog(null);
                }}
                resolve={(values: Values) => {
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
                }}
                diverge={(clickInfo: EventClickArg) => {
                    setDialog(
                        <Delete
                            clickInfo={clickInfo}
                            reject={() => {
                                setDialog(null);
                            }}
                            resolve={() => {
                                clickInfo.event.remove(); // will render immediately. will call handleEventRemove

                                setDialog(null);
                            }}
                        />
                    );
                }}
            />
        ),
        clickInfo.view.calendar.unselect()
    );

    const reportNetworkError = (): void => setDialog(
        <Network
            dismiss={() => {
                setDialog(null);
            }}
            diverge={() => {
                window.location.reload();

                setDialog(null);
            }}
        />
    );

    const handleDates = (rangeInfo: RangeApi) => setRange({
        startStr: rangeInfo.startStr,
        endStr: rangeInfo.endStr,
    });
    
    const handleEventAdd = (addInfo: EventAddArg) => createEvent && createEvent(
        addInfo.event.toPlainObject()
    ).catch(() => {
        reportNetworkError();

        addInfo.revert();
    });
    
    const handleEventChange = (changeInfo: EventChangeArg) => updateEvent && updateEvent(
        changeInfo.event.toPlainObject())
    .catch(() => {
        reportNetworkError();

        changeInfo.revert();
    });
    
    const handleEventRemove = (removeInfo: EventRemoveArg) => deleteEvent && deleteEvent(
        removeInfo.event.id)
    .catch(() => {
        reportNetworkError();

        removeInfo.revert();
    });

    useEffect(() => {
        if (!range) {
            return;
        }

        requestEvents && requestEvents(
            range.startStr, range.endStr)
        .catch(reportNetworkError);
    }, [range]);

    useEffect(() => setCurrent(
        detect(primary, secondary, tetriary, auxilary)),
        [primary, secondary, tetriary, auxilary]
    );

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

        console.log('scrollToTime', current.time);

        if (current.time) {
            calendar.current?.getApi().scrollToTime(current.time);
        }
    }, [current]);

    return (
        <>
            <Header
                calendar={calendar}
                navigate={navigate}
                inRangeCurrent={inRangeCurrent}
            />
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
                nowIndicator={true}
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
  
export default connect(mapStateToProps, actionCreators)(Calendar);
