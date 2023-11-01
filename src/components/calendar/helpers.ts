import { createSelector } from 'reselect';
import { CalendarProps, State } from "../interfaces";
import { getHashValues } from "../utils";

export function mapStateToProps (): (state: State) => CalendarProps {
    const getEventArray = createSelector(
        (state: State) => state.eventsById,
        getHashValues,
    );

    return (state: State) => {
        return {
            events: getEventArray(state),
            weekendsVisible: state.weekendsVisible,
        }
    }
}
