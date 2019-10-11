interface FactoryFunction extends Function {
    (): (new () => {}) | {
        [key: string]: any;
    };
}
export interface ContainerInterface {
    /**
     * Find a service in the container by its identifier and returns it.
     * @param id
     * @return any
     */
    get(id: any): any;
    /**
     * Check if given name has been registered.
     * @param id
     */
    has(id: string): boolean;
    /**
     * Register an existing instance as shared in the container.
     * @param name
     * @param factory
     */
    instance<T>(name: string, factory: T | FactoryFunction): T;
    /**
     * Register a shared binding in the container.
     * @param abstract
     * @param factory
     */
    singleton(abstract: string, factory: FactoryFunction): void;
    /**
     * Extend a exists instance in the container.
     * Modify services after definition.
     * Must return a wrapped instance.
     *
     * A little same as decorator.
     * > An example for decorator:
     * ```js
     * Container.decorator('Test', function (test){
     *   // do something with test
     *   doSomethingWith(test);
     *   // return a new Test has been decorated.
     *   return test;
     * })
     * ````
     */
    extend(name: string, func: ExtendClosure): void;
    /**
     * Register middleware.
     * Similar to extend method, but middleware dose not return the instance.
     * @param name
     * @param [func]
     */
    middleware(name: string, func: Function): void;
    middleware(func: Function): void;
    /**
     * Register a binding with the container.
     * @param {String} abstract
     * @param {FactoryFunction} factory
     * @param {Boolean} singleton
     */
    bind(abstract: string, factory: FactoryFunction, singleton: boolean): void;
    /**
     * Assign tag|tags to bound object(s).
     *
     * @param name
     * @param tags
     */
    tag(name: string | string[], tags: any): void;
    /**
     * Create a instance of service provider
     *
     * >> explore
     *
     * ```js
     * kernel.make(['sound', 'setting']).then((sound, setting)=>{
     *  sound.play('ss.mp3')
     * })
     * // or
     * kernel.make(['sound', 'setting'], (sound, setting) => {
     *  sound.play('ss.mp3')
     * })
     * // or
     * const sound = kernel.make('sound')
     * const setting = kernel.make('setting')
     * sound.play('ss.mp3')
     * // or
     * const [sound, setting] = kernel(['sound', 'setting'])
     * ```
     *
     * @param name
     * @param arg
     */
    make(name: string | string[], ...arg: any[]): Promise<any>;
    resolve(name: string | string[], func: Function): any;
    /**
     * Check if the given name has been resolved.
     * @param name
     */
    isResolved(name: any): boolean;
    /**
     * Check the given service is a singleton.
     * @param name
     */
    isSingleton(name: string): boolean;
    destroy(): void;
}
declare type ExtendClosure = (item: any, kernel: ServiceContainer) => any;
export default abstract class ServiceContainer implements ContainerInterface {
    /**
     * The container's shared instances.
     */
    protected instances: {
        [key: string]: any;
    };
    /**
     * The container's bindings.
     */
    protected bindings: {
        [key: string]: {
            factory: FactoryFunction;
            singleton: boolean;
        };
    };
    /**
     * Registered object alias.
     */
    /**
     * Tags of registered services.
     */
    protected tags: {
        [key: string]: string[];
    };
    /**
     * A map of the types that have been resolved.
     */
    protected resolved: {
        [key: string]: boolean;
    };
    /**
     * The extend closures of services.
     */
    protected extenders: {
        [key: string]: ExtendClosure[];
    };
    /**
     * Middlewares of services.
     */
    protected middlewares: {
        [key: string]: Function[];
    };
    /**
     * @inheritDoc
     * @param id
     */
    get(id: any): void;
    /**
     * Check if given name has been registered.
     * @param id
     */
    has(id: string): boolean;
    /**
     * Register an existing instance or a function that return the instance as shared in the container.
     * @param name
     * @param {FactoryFunction} factory
     */
    instance<T>(name: string, factory: T | FactoryFunction): T;
    /**
     * Register a shared binding in the container.
     * The difference of *signleton* and *instance* method is *signleton* only receive factory function,
     * but *instance* can also receive a constructed instance.
     * @param abstract
     * @param {FactoryFunction} factory
     */
    singleton(abstract: string, factory: FactoryFunction): void;
    /**
     * Register a binding with the container.
     * @param {String} abstract
     * @param {FactoryFunction} factory
     * @param {Boolean} singleton
     */
    bind(abstract: string, factory: FactoryFunction, singleton?: boolean): void;
    /**
     * Extend a exists instance in the container.
     *
     * A little same as decorator.
     * > An example for decorator:
     * ```js
     * Container.decorator('Test', function (test){
      *   // do something with test
      *   doSomethingWith(test);
      *   // return a new Test has been decorated.
      *   return test;
      * })
      * ````
      */
    extend(name: string, closure: ExtendClosure): void;
    /**
     * @inheritdoc
     * @param name
     * @param func
     */
    middleware(name: string | Function, func?: Function): this;
    /**
     * Assign tag|tags to bound object(s).
     *
     * @param name
     * @param tags
     */
    tag(name: string | string[], tags: any): void;
    /**
     * Create a instance of service provider
     *
     * >> explore
     *
     * ```js
     * kernel.make(['sound', 'setting']).then(([sound, setting])=>{
     *  sound.play('ss.mp3')
     * })
     * // or
     * kernel.make(['sound', 'setting'], (sound, setting) => {
     *  sound.play('ss.mp3')
     * })
     * // or
     * const sound = kernel.make('sound')
     * const setting = kernel.make('setting')
     * sound.play('ss.mp3')
     * // or
     * const [sound, setting] = kernel(['sound', 'setting'])
     * ```
     * @example
     *  kernel.make('test').then(test=>test.doSomething())
     *  kernel.make('test,test2').then(([test,test2])=>{
     *    test.doSomething();
     *    test2.doSomething();
     *  })
     *  kernel.make(['test', 'test2']).then(([test, test2])=>{
     *    test.doSomething();
     *    test2.doSomething();
     *  })
     * @param deps
     * @param arg
     */
    make(deps: string | string[], ...arg: any[]): Promise<any>;
    /**
     * @link https://www.cnblogs.com/pqjwyn/p/9850428.html
     * @param deps
     * @param func
     * @param parameters
     * @example
     * kernel.resolve('test', function(test){test.doSomething()})
     * kernel.resolve('test,test2', function(test, test2){test.doSomething(); test2.doSomething()})
     * kernel.resolve(['test','test2'], function(test, test2){test.doSomething(); test2.doSomething()})
     */
    resolve(deps: string | string[], func: Function, parameters?: any[]): void;
    /**
     * Check if the given name has been resolved.
     * @param name
     */
    isResolved(name: any): boolean;
    /**
     * Check the given service is a singleton.
     * @param name
     */
    isSingleton(name: string): boolean;
    destroy(): void;
    protected rebound(name: any): void;
    protected build(name: string, parameters?: any[]): any;
    protected getExtenders(name: string): ExtendClosure[];
}
export {};
