// src/firebase/error-emitter.ts
import { EventEmitter } from 'events';

// This is a global event emitter to handle specific app-wide events.
export const errorEmitter = new EventEmitter();
