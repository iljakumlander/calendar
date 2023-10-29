import { Event, EventId } from './types';

const server = process.env.SERVER || 'http://localhost:3000';

export async function requestEventsInRange(startStr: string, endStr: string): Promise<Event[]>  {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${server}/api/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startStr,
            endStr,
          })
        }
      );
      const events = await response.json()
  
      resolve(events);
    }
  
    catch (exception) {
      reject(exception);
    }
  });
}

export async function requestEventCreate(plainEventObject: Event): Promise<Event> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${server}/api/event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plainEventObject)
        }
      );
      const event = await response.json()
  
      resolve(event);
    }
  
    catch (exception) {
      reject(exception);
    }
  });
}

export async function requestEventUpdate(plainEventObject: Event): Promise<Event> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${server}/api/event/${plainEventObject.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plainEventObject)
        }
      );
      const event = await response.json()
  
      resolve(event);
    }

    catch (exception) {
      reject(exception);
    }
  });
}

export async function requestEventDelete(eventId: EventId): Promise<Event[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `${server}/api/event/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const event = await response.json()
  
      resolve(event);
    }

    catch (exception) {
      reject(exception);
    }
  });
}
