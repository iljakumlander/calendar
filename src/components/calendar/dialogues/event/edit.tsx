import React from 'react';

import Dialog from '../../../dialog';
import { formatDate } from '@fullcalendar/core';
import { UpdateEventDialog } from '../../../types';
import { formatDateConfig } from '../config';

const Edit = ({
    clickInfo,
    colors,
    dismiss,
    resolve,
    diverge,
}: UpdateEventDialog
): JSX.Element => (
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
                type: 'select',
                value: clickInfo.event.backgroundColor,
                title: 'Background',
                required: false,
                options: [
                    {
                        value: '',
                        label: 'Default',
                    },
                    ...Object.keys(colors || []).map((color) => ({
                        value: color,
                        label: color,
                        ...(color === clickInfo.event.backgroundColor && { selected: true }),
                    })),
                ],
            },
        ]}
        actions={
            {
                ...(dismiss && {
                    dismiss: {
                        type: 'dismiss',
                        caption: 'Cancel',
                        callback: () => dismiss(),
                    },
                }),
                ...(resolve && {
                    resolve: {
                        type: 'resolve',
                        caption: 'Save',
                        callback: (values) => resolve(values),
                    },
                }),
                ...(diverge && {
                    diverge: {
                        type: 'diverge',
                        caption: 'Delete...',
                        callback: () => diverge(clickInfo),
                    },
                }),
            }
        }
    />
);

export default Edit;
