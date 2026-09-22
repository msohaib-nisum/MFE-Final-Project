/**
 * NISUM Event System
 * Global event emitter/listener for cross-MFE communication
 * Accessible via window.NISUM
 */

type EventListener = (data: any) => void;

class EventEmitter {
  private listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * Emit an event to all listeners
   * @param eventName - Name of the event
   * @param data - Data to pass to listeners
   */
  emit(eventName: string, data: any): void {
    // Dispatch custom event on window
    const event = new CustomEvent(eventName, {
      detail: data,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    // Also trigger internal listeners
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in listener for ${eventName}:`, error);
        }
      });
    }

    console.log(`[NISUM] Event emitted: ${eventName}`, data);
  }

  /**
   * Listen for an event
   * @param eventName - Name of the event to listen for
   * @param handler - Callback function
   * @returns Unsubscribe function to remove listener
   */
  listener(eventName: string, handler: EventListener): () => void {
    // Add to internal listeners
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(handler);

    // Add window event listener
    const windowListener = (event: any) => {
      if (event instanceof CustomEvent) {
        handler(event.detail);
      }
    };

    window.addEventListener(eventName, windowListener);

    console.log(`[NISUM] Listener registered for: ${eventName}`);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventName)?.delete(handler);
      window.removeEventListener(eventName, windowListener);
      console.log(`[NISUM] Listener removed for: ${eventName}`);
    };
  }

  /**
   * Remove all listeners for an event
   * @param eventName - Event name to clear
   */
  clear(eventName: string): void {
    this.listeners.delete(eventName);
    console.log(`[NISUM] All listeners cleared for: ${eventName}`);
  }

  /**
   * Get count of listeners for an event
   * @param eventName - Event name
   * @returns Number of listeners
   */
  listenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.size ?? 0;
  }
}

// Create singleton instance
const nisumInstance = new EventEmitter();

// Attach to window object
declare global {
  interface Window {
    NISUM: typeof nisumInstance;
  }
}

if (typeof window !== 'undefined') {
  (window as any).NISUM = nisumInstance;
}

export const NISUM = nisumInstance;
export default NISUM;
