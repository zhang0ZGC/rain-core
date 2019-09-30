interface ListenerItem {
    listener: Function;
    once?: boolean;
}
export interface EventDispatcherInterface {
    /**
     * Dispatch events.
     */
    dispatch<T>(event: T, eventName?: string): T;
}
declare class Event {
    protected propagationStopped: boolean;
    protected defaultPrevented: boolean;
    private eventData;
    constructor(data: any, name: string);
    stopPropagation(): void;
    preventDefault(): void;
    get(key: any): any;
    set(key: any, data: any): void;
    isPropagationStopped(): boolean;
    isDefaultPrevented(): boolean;
}
export declare function createEvent(eventName: any, data: any): Event;
declare class EventDispatcher {
    private listeners;
    private sorted;
    /**
     * @inheritDoc
     */
    dispatch(event: Event, eventName?: string): Event;
    /**
     * Alias of dispatch
     * @param event
     * @param eventName
     */
    emit(event: Event, eventName?: string): any;
    /**
     * Alias of addListener.
     * @param eventName
     * @param listener
     * @param once
     */
    on(eventName: string, listener: Function, once?: boolean): this;
    /**
     * Alias of addListener(eventName, listener, true)
     * @param eventName
     * @param listener
     */
    once(eventName: string, listener: Function): this;
    /**
     * Alias of removeListener.
     * @param eventName
     * @param listener
     */
    off(eventName: string, listener?: Function): this;
    addListener(eventName: string, listener: Function, once?: boolean): this;
    removeListener(eventName: string, listener: Function): this;
    /**
     * Check whether a event has binding listeners.
     * @param eventName
     */
    hasListeners(eventName?: string): boolean;
    /**
     * Get all listeners bound to the event.
     * @param eventName
     */
    getListeners(eventName?: string): any;
    /**
     * Sort listener to.
     * Todo: 按字母排序，使相同命名空间的listener在一起
     * Todo: 指定排序字段，按值排序
     * @param eventName
     */
    protected sortListeners(eventName: string): void;
    /**
     * Process event listeners.
     * @param listeners
     * @param eventName
     * @param event
     */
    protected callListeners(listeners: ListenerItem[], eventName: string, event: Event): void;
}
export default EventDispatcher;
