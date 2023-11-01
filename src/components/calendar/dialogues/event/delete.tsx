import React from 'react';

import Dialog from '../../../dialog';
import { formatDate } from '@fullcalendar/core';
import { DeleteEventDialog, Values } from '../../../types';
import { formatDateConfig } from '../config';

const Delete = ({
    clickInfo,
    reject,
    resolve,
}: DeleteEventDialog
): JSX.Element => (
    <Dialog
        title='Delete event?'
        message={`Are you sure you want to delete '${clickInfo.event.title}' that runs from ${formatDate(clickInfo.event.startStr, formatDateConfig)} to ${formatDate(clickInfo.event.endStr, formatDateConfig)} event? There is no undo for this action.`}
        prefer="reject"
        autofocus={true}
        inputs={[]}
        actions={
            {
                ...(reject && {
                    reject: {
                        type: 'reject',
                        caption: 'Keep',
                        callback: () => reject(),
                    },
                }),
                ...(resolve && {
                    resolve: {
                        type: 'resolve',
                        caption: 'Delete',
                        callback: (values: Values) => resolve(values),
                    },
                }), 
            }
        }
    />
);

export default Delete;
