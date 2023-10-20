import { combineReducers } from 'redux';
import { hashById } from './utils';
import { Event, Action, Hash } from './types';

export default combineReducers({
  weekendsVisible,
  eventsById,
})

function weekendsVisible(weekendsVisible: boolean = true, action: Action) {
  switch (action.type) {
    case 'TOGGLE_WEEKENDS':
      return !weekendsVisible

    default:
      return weekendsVisible
  }
}

function eventsById (eventsById: Hash<Event> = {}, action: Action): Hash<Event> {
  switch (action.type) {
    case 'RECEIVE_EVENTS':
      return hashById(action.plainEventObjects as Event[]);

    case 'CREATE_EVENT':
    case 'UPDATE_EVENT':
      return {
        ...eventsById,
        [action.plainEventObject.id]: action.plainEventObject,
      }

    case 'DELETE_EVENT':
      const copy: Hash<Event> = { ...eventsById };

      delete copy[action.eventId];

      return copy;

    default:
      return eventsById;
  }
}
