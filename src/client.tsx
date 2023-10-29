import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { store, persistor } from './components/store';
import Calendar from './components/calendar';

import './index.scss';

const router = createBrowserRouter([
  {
    path: "/:primary?/:secondary?/:tetriary?/:auxilary?",
    element: <Calendar />,
  },
], {
  basename: process.env.CLIENT_ROOT || '/',
});

const node = document.querySelector('body') as HTMLBodyElement;
const root = createRoot(node);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
