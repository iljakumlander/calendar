import { requestEventsInRange, requestEventCreate, requestEventUpdate, requestEventDelete } from './requests';
import { Event } from './types';
import { ActionCommon, Dispatch, EventId } from './types';

export default {
  toggleWeekends (): ActionCommon  {
    return {
      type: 'TOGGLE_WEEKENDS'
    };
  },
  requestEvents (start: string, end: string): (dispatch: Dispatch) => Promise<void> {
      return async (dispatch: Dispatch) => {
        const plainEventObjects = await requestEventsInRange(start, end);

        dispatch({
          type: 'RECEIVE_EVENTS',
          plainEventObjects
        });
      };
  },
  createEvent (plainEventObject: Event): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
      const newEvent = await requestEventCreate(plainEventObject);

      dispatch({
        type: 'CREATE_EVENT',
        plainEventObject: {
          ...plainEventObject,
          id: newEvent.id,
        }
      });
    };
  },
  updateEvent (plainEventObject: Event): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
      await requestEventUpdate(plainEventObject);

      dispatch({
        type: 'UPDATE_EVENT',
        plainEventObject
      });
    };
  },
  deleteEvent (eventId: EventId): (dispatch: Dispatch) => Promise<void> {
    return async (dispatch: Dispatch) => {
      await requestEventDelete(eventId);

      dispatch({
        type: 'DELETE_EVENT',
        eventId
      });
    };
  },
};
