interface ListenerItem {
    listener: Function;
    once?: boolean;
}
declare type ListenerItemKeyMap = {
    [key: string]: ListenerItem[];
};
declare class EventDispatcher<TEvent extends string = string> {
    private listeners;
    /**
     * Dispatch an event.
     * @param eventName
     * @param args
     */
    dispatch(eventName: TEvent, args?: any[]): this;
    /**
     * Dispatch an event.
     * Unlike dispatch, emit passes the remaining parameters instead of an array.
     * @param eventName
     * @param args
     */
    emit(eventName: TEvent, ...args: any[]): this;
    /**
     * Alias of addListener.
     * @param eventName
     * @param listener
     * @param once
     */
    on(eventName: TEvent, listener: Function, once?: boolean): this;
    /**
     * Alias of addListener(eventName, listener, true)
     * @param eventName
     * @param listener
     */
    once(eventName: TEvent, listener: Function): this;
    /**
     * Alias of removeListener.
     * @param eventName
     * @param listener
     */
    off(eventName: TEvent, listener?: Function): this;
    /**
     * Add event listener.
     * @param eventName
     * @param listener
     * @param once
     */
    addListener(eventName: TEvent, listener: Function, once?: boolean): this;
    /**
     * Remove event listener.
     * @param eventName
     * @param listener
     */
    removeListener(eventName: TEvent, listener: Function): this;
    /**
     * Remove part listeners bound to eventName / all listeners of eventName / all listeners.
     * @param eventName
     * @param listeners
     */
    removeListeners(eventName?: TEvent, listeners?: Function[]): this;
    /**
     * Check whether a event has binding listeners.
     * @param eventName
     */
    hasListeners(eventName?: TEvent): boolean;
    /**
     * Get all listeners bound to the event.
     * @param eventName
     */
    getListeners(eventName?: TEvent): ListenerItem[] | ListenerItemKeyMap;
    /**
     * Process event listeners.
     * @param listeners
     * @param eventName
     * @param args
     */
    protected callListeners(listeners: ListenerItem[], eventName: TEvent, args?: any[]): void;
}
export default EventDispatcher;
