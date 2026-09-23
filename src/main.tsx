import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@fontsource-variable/public-sans';
import './styles.css';
import './theme/tokens/tailwind.css';
import './erp.css';
import './design-v2.css';
import './coa-v2.css';
import './components/primitives/primitives.css';
import './components/overlays/overlays.css';
import './components/workflow/workflow.css';
import './components/shell/shell.css';
import './theme/motion.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
