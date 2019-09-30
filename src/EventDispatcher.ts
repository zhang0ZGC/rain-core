interface ListenerItem{
  listener: Function,
  once?: boolean,
}

export interface EventDispatcherInterface {
  /**
   * Dispatch events.
   */
  dispatch<T>(event: T, eventName?: string): T;
}

class Event {
  protected propagationStopped: boolean = false;
  protected defaultPrevented: boolean = false;

  private eventData: {};

  constructor(data, name: string){

    this.eventData = {};
  }

  public stopPropagation(){
    this.propagationStopped = true;
  }

  public preventDefault(){
    this.defaultPrevented = true;
  }

  public get(key){
    return this.eventData[key];
  }

  public set(key, data){
    this.eventData[key] = data;
  }


  public isPropagationStopped(){
    return this.propagationStopped;
  }

  public isDefaultPrevented(){
    return this.defaultPrevented;
  }

}

export function createEvent(eventName, data) {
  return new Event(eventName, data);
}


class EventDispatcher {

  private listeners: {[key: string]: Array<{listener: Function, once?: boolean}>} = {};
  private sorted = {};


  /**
   * @inheritDoc
   */
  public dispatch(event: Event, eventName: string = null){
    if (eventName in this.listeners) {
      const listeners = this.listeners[eventName];
      this.callListeners(listeners, eventName, event);
    }

    return event;
  }

  /**
   * Alias of dispatch
   * @param event 
   * @param eventName 
   */
  public emit(event: Event, eventName: string = null){
    return this.dispatch.apply(this, arguments);
  }

  /**
   * Alias of addListener.
   * @param eventName
   * @param listener
   * @param once
   */
  public on(eventName: string, listener: Function, once: boolean = false): this{
    return this.addListener(eventName, listener, once);
  }

  /**
   * Alias of addListener(eventName, listener, true)
   * @param eventName
   * @param listener
   */
  public once(eventName: string, listener: Function): this{
    return this.addListener(eventName, listener, true);
  }

  /**
   * Alias of removeListener.
   * @param eventName
   * @param listener
   */
  public off(eventName: string, listener?: Function): this{
    return this.removeListener(eventName, listener);
  }

  public addListener(eventName: string, listener: Function, once: boolean= false): this{
    if (!this.listeners[eventName]){
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

  public removeListener(eventName: string, listener: Function): this{
    const arr = this.listeners[eventName];
    if (!arr) return;
    const idx = arr.findIndex(item => item.listener === listener);
    if (idx !== -1){
      if (arr.length > 1){
        this.listeners[eventName] = arr.slice(0, idx).concat(arr.slice(idx + 1));
      } else {
        delete this.listeners[eventName];
      }
    }
    return this;
  }

  /**
   * Check whether a event has binding listeners.
   * @param eventName
   */
  public hasListeners(eventName?: string): boolean{
    if (eventName){
      return this.listeners[eventName].length > 0;
    }

    return !!Object.keys(this.listeners).find(listener => Boolean(listener))
  }

  /**
   * Get all listeners bound to the event.
   * @param eventName
   */
  public getListeners(eventName?: string){
    if (eventName){
      if (!this.listeners[eventName]){
        return [];
      }
      if (!this.sorted[eventName]){
        this.sortListeners(eventName);
      }
      return this.sorted[eventName];
    }

    Object.keys(this.listeners).forEach(key => {
      if (!this.sorted[key]){
        this.sortListeners(key);
      }
    });
    return this.sorted;
  }

  /**
   * Sort listener to.
   * Todo: 按字母排序，使相同命名空间的listener在一起
   * Todo: 指定排序字段，按值排序
   * @param eventName
   */
  protected sortListeners(eventName: string){

    const sortedListeners = [];

    let i = 0;
    let allListenersCount = Object.keys(this.listeners).length;
    let listeners;
    let listener;
    for(; i < allListenersCount; i++){
      listeners = this.listeners[eventName];
      for (let j = 0; j < listeners.length; j++){

        listener = listeners[j];
        sortedListeners.push(listener)
      }
    }
    listeners = listener = null;
    this.sorted[eventName] = sortedListeners;
  }

  /**
   * Process event listeners.
   * @param listeners
   * @param eventName
   * @param event
   */
  protected callListeners(listeners: ListenerItem[], eventName: string, event: Event){
    let listener: ListenerItem;
    for(let i=0; i < listeners.length; i++){
      if (event.isPropagationStopped()) {
        break;
      }
      listener = listeners[i];

      if (listener.once){
        this.removeListener(eventName, listener.listener);
      }

      listener.listener(event);
      // listener.listener.apply(this, event);
    }
  }
}

export default EventDispatcher;
