import React from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {SimulationStore} from './clinical/store';
import './style.css';

let storage:Storage|undefined;
try{storage=window.localStorage;}catch{/* The app remains usable without persistence. */}
const store=new SimulationStore(storage);
createRoot(document.getElementById('root')!).render(<App store={store}/>);
