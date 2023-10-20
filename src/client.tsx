import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './components/store';
import Calendar from './components/calendar';

import './index.scss';

const Client = (): JSX.Element => (
  <Calendar />
);
const node = document.querySelector('body') as HTMLBodyElement;
const root = createRoot(node);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Client />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
