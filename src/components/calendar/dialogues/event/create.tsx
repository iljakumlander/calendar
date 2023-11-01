import React from 'react';

import Dialog from '../../../dialog';
import { formatDate } from '@fullcalendar/core';
import { CreateEventDialog } from '../../../types';
import { formatDateConfig } from '../config';

const Create = ({
    selectInfo,
    colors,
    dismiss,
    resolve,
}: CreateEventDialog
): JSX.Element => (
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
                type: 'select',
                value: '',
                title: 'Backgroundd',
                required: false,
                options: [
                    {
                        value: '',
                        label: 'Default',
                    },
                    ...Object.keys(colors || []).map((color) => ({
                        value: color,
                        label: color,
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
                        caption: 'Create',
                        callback: (values) => resolve(values),
                    },
                }),
            }
        }
    />
);

export default Create;
