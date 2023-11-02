import React from 'react';

import Dialog from '../../../dialog';
import { NetworkErrorDialog } from '../../../types';

const Network = ({
    diverge,
    dismiss,
}: NetworkErrorDialog
): JSX.Element => (
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
                    caption: 'Dismiss',
                    callback: () => dismiss(),
                },
                diverge: {
                    type: 'diverge',
                    caption: 'Refresh page',
                    callback: () => diverge(),
                },
            }
        }
    />
);

export default Network;
