
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// render initially
renderApp();

// re-render on history navigation so App can react to path changes
window.addEventListener('popstate', () => {
  renderApp();
});

// expose for programmatic navigation if needed
(window as any).renderApp = renderApp;
