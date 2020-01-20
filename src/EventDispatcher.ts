export interface ListenerItem {
  listener: Function;
  once?: boolean;
}

export type ListenerItemKeyMap = {
  [key: string]: ListenerItem[];
};

function getListenerIndex(listeners: ListenerItem[], listener: ListenerItem['listener']): number {
  let l = listeners.length;
  while (l--) {
    if (listeners[l].listener === listener) {
      return l;
    }
  }
  return -1;
}

class EventDispatcher<TEvent extends string = string> {
  private listeners: ListenerItemKeyMap = {};

  /**
   * Dispatch an event.
   * @param eventName
   * @param args
   */
  public dispatch(eventName: TEvent, args?: any[]): this {
    if (eventName in this.listeners) {
      const listeners = this.listeners[eventName];
      this.callListeners(listeners, eventName, args);
    }

    return this;
  }

  /**
   * Dispatch an event.
   * Unlike dispatch, emit passes the remaining parameters instead of an array.
   * @param eventName
   * @param args
   */
  public emit(eventName: TEvent, ...args: any[]): this {
    // const _args = Array.prototype.slice.call(arguments, 1);
    return this.dispatch(eventName, args);
  }

  /**
   * Alias of addListener.
   * @param eventName
   * @param listener
   * @param once
   */
  public on(eventName: TEvent, listener: Function, once = false): this {
    return this.addListener(eventName, listener, once);
  }

  /**
   * Alias of addListener(eventName, listener, true)
   * @param eventName
   * @param listener
   */
  public once(eventName: TEvent, listener: Function): this {
    return this.addListener(eventName, listener, true);
  }

  /**
   * Alias of removeListener.
   * @param eventName
   * @param listener
   */
  public off(eventName: TEvent, listener?: Function): this {
    if (listener) return this.removeListener(eventName, listener);
    else return this;
  }

  /**
   * Add event listener.
   * @param eventName
   * @param listener
   * @param once
   */
  public addListener(eventName: TEvent, listener: Function, once = false): this {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    // @todo filter repeat listener
    /*
    let arr = this.listeners[eventName];
    arr = arr.concat([{listener, once}]);
    this.listeners[eventName] = arr;
    return this;
    */

    this.listeners[eventName].push({
      listener,
      once
    });

    return this;
  }

  /**
   * Remove event listener.
   * @param eventName
   * @param listener
   */
  public removeListener(eventName: TEvent, listener: Function): this {
    const arr = this.listeners[eventName];
    if (!arr || arr.length === 0) return this;
    const idx = getListenerIndex(arr, listener);
    if (idx !== -1) {
      arr.splice(idx, 1);
      /*
      if (arr.length > 1) {
        this.listeners[eventName] = arr.slice(0, idx).concat(arr.slice(idx + 1));
      } else {
        delete this.listeners[eventName];
      }
      */
    }
    return this;
  }

  /**
   * Remove part listeners bound to eventName / all listeners of eventName / all listeners.
   * @param eventName
   * @param listeners
   */
  public removeListeners(eventName?: TEvent, listeners?: Function[]): this {
    if (eventName && this.listeners[eventName]) {
      // filter compatibility： IE>=9
      this.listeners[eventName] = listeners ? this.listeners[eventName].filter(item => listeners.indexOf(item.listener) === -1) : [];
    } else {
      this.listeners = {};
    }
    return this;
  }

  /**
   * Check whether a event has binding listeners.
   * @param eventName
   */
  public hasListeners(eventName?: TEvent): boolean {
    if (eventName) {
      return this.listeners[eventName].length > 0;
    }

    return !!Object.keys(this.listeners).find(listener => Boolean(listener))
  }

  /**
   * Get all listeners bound to the event.
   * @param eventName
   */
  public getListeners(eventName?: TEvent): ListenerItem[] | ListenerItemKeyMap {
    if (eventName) {
      return this.listeners[eventName] || [];
    }

    return this.listeners;
  }

  /**
   * Process event listeners.
   * @param listeners
   * @param eventName
   * @param args
   */
  protected callListeners(listeners: ListenerItem[], eventName: TEvent, args?: any[]): void {
    listeners = Array.prototype.slice.call(listeners);
    // const defer = typeof Promise === 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
    const process = (): void => {
      let listener: ListenerItem | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: false | any;
      const start = +new Date();
      while ((listener = listeners.shift())) {
        if (listener.once) {
          this.removeListener(eventName, listener.listener);
        }
        // If result===false, stop listener call
        result = listener.listener.apply(this, args || []);
        // result = listener.listener(args || [])
        if (result === false || +new Date() - start > 25) {
          break;
        }
      }
      if (result !== false && listener) {
        setTimeout(process);
        // requestAnimationFrame(process);
      }
    };
    process();

    /*
    let listener: ListenerItem;
    let result: any;
    for (let i = 0; i < listeners.length; i++) {
      listener = listeners[i];
      if (listener.once) {
        this.removeListener(eventName, listener.listener);
      }

      // If return false, meaning stop event propagation
      // listener.listener(event);
      result = listener.listener.apply(this, args || []);
      if (result === false) break;
    }
    */
  }
}

export default EventDispatcher;
