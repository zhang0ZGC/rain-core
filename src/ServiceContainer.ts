'use strict';
import {ServiceProviderInterface} from "./ServiceProvider";

interface FactoryFunction extends Function{
  () : (new ()=>{}) | {[key: string]: any};
}

export interface ContainerInterface {
  /**
   * Find a service in the container by its identifier and returns it.
   * @param id
   * @return any
   */
  get(id);

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
  make(name: string|string[], ...arg): Promise<any>;

  resolve(name: string|string[], func: Function);

  /**
   * Check if the given name has been resolved.
   * @param name
   */
  isResolved(name): boolean;

  /**
   * Check the given service is a singleton.
   * @param name
   */
  isSingleton(name: string): boolean;

  destroy(): void;
}

type ExtendClosure = (item: any, kernel: ServiceContainer) => any;

const getServiceNames = (name: string|string[]): string[] => {
  return Array.isArray(name) ? name : String(name).replace(/\s+/g, '').split(',')
};

function applyMiddlewares(middlewares: Function[], instance){
  if (middlewares.length){
    let idx = 0;
    const next = function nextMiddleware(err?){
      if (err){
        throw err;
      }

      if (middlewares[idx]){
        middlewares[idx++].call(null, instance, next);
      }
    };
    next();
  }
  return instance;
}

export default abstract class ServiceContainer implements ContainerInterface {
  /**
   * The container's shared instances.
   */
  protected instances: { [key: string]: any } = {};
  /**
   * The container's bindings.
   */
  protected bindings: { [key: string]: { factory: FactoryFunction, singleton: boolean } } = {};
  /**
   * Registered object alias.
   */
  // protected alias: { [key: string]: string[] } = {};
  /**
   * Tags of registered services.
   */
  protected tags: { [key: string]: string[] } = {};

  /**
   * A map of the types that have been resolved.
   */
  protected resolved: { [key: string]: boolean } = {};
  /**
   * The extend closures of services.
   */
  protected extenders: { [key: string]: ExtendClosure[] } = {};
  /**
   * Middlewares of services.
   */
  protected middlewares: { [key: string]: Function[]} = {};

  /**
   * @inheritDoc
   * @param id
   */
  public get(id) {

  }

  /**
   * Check if given name has been registered.
   * @param id
   */
  public has(id: string) {
    // return id in this.instances || id in this.bindings;
    return this.instances.hasOwnProperty(id) || this.bindings.hasOwnProperty(id);
  }

  /**
   * Register an existing instance or a function that return the instance as shared in the container.
   * @param name
   * @param {FactoryFunction} factory
   */
  public instance<T>(name: string, factory: T | FactoryFunction): T {
    const instance = typeof factory === 'function' ? factory.call({}) : factory;
    this.instances[name] = instance;
    return instance;
  }

  /**
   * Register a shared binding in the container.
   * The difference of *signleton* and *instance* method is *signleton* only receive factory function,
   * but *instance* can also receive a constructed instance.
   * @param abstract
   * @param {FactoryFunction} factory
   */
  public singleton(abstract: string, factory: FactoryFunction): void {
    this.bind(abstract, factory, true);
  }

  /**
   * Register a binding with the container.
   * @param {String} abstract
   * @param {FactoryFunction} factory
   * @param {Boolean} singleton
   */
  public bind(abstract: string, factory: FactoryFunction, singleton: boolean = false) {
    // drop stale instance
    delete this.instances[abstract];
    // todo: If factory is not a function, create a closure that return it

    this.bindings[abstract] = {
      factory,
      singleton,
    };

    // If the abstract type was already resolved in the container, rebound and replace it.
    if (this.isResolved(abstract)) {
      this.rebound(abstract);
    }
  }

  /**
   * Extend a exists instance in the container.
   *
   * Same as decorator.
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
   public extend(name: string, closure: ExtendClosure) {
     if (name in this.instances) {
       // If instance is already exists, replace.
       this.instances[name] = closure(this.instances[name], this);
     } else {
       // Else store closure in extenders, then execute it when the service is construct.
       if (!this.extenders.hasOwnProperty(name)) {
         this.extenders[name] = [];
       }
       this.extenders[name].push(closure);

       if (this.isResolved(name)) {
         this.rebound(name);
       }
     }
   }

   /**
    * @inheritdoc
    * @param name
    * @param func
    *
    * @example
    * ```js
    * Container.middleware('Test', function(test, next){
    *   test.someMethod();
    *   next();
    * })
    * ```
    */
   public middleware(name: string | Function, func?: Function) {
      if (typeof name === 'function'){
        func = name;
        name = '__GLOBAL';
      }

      // @todo Support nested service name 支持循环嵌套的service name
      if (!this.middlewares){
        this.middlewares[name] = [];
      }
      this.middlewares[name].push(func);

      return this;
   }

  /**
   * Assign tag|tags to bound object(s).
   *
   * @param name
   * @param tags
   */
  public tag(name: string | string[], tags: any) {
    let tarArr = [];
    if (tags instanceof Array) {
      tarArr = tags;
    } else {
      for (let i = 1; i < arguments.length; i++) {
        tarArr[i - 1] = arguments[i];
      }
    }

    tarArr.forEach(tag => {
      if (!(tag in this.tags)) {
        this.tags[tag] = [];
      }
      if (name instanceof Array) {
        name.forEach(item => {
          this.tags[tag].push(item);
        });
      } else {
        this.tags[tag].push(name)
      }
    });
  }

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
  public make(deps: string|string[], ...arg): Promise<any> {
    return new Promise(((resolve, reject) => {
      const names = getServiceNames(deps);
      function resolveDeps(){
        if (Array.isArray(deps) || names.length > 1){
          // const obj = {};
          const arr = [];
          for (let i=0; i<names.length; i++){
            // obj[names[i]] = arguments[i];
            arr.push(arguments[i]);
          }
          // resolve(obj);
          resolve(arr);
        } else {
          resolve(arguments[0]);
        }
      }
      try {
        this.resolve(names, resolveDeps, ...arg);
      }catch (e) {
        reject(e);
      }
    }))
  }

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
  public resolve(deps: string|string[], func: Function, parameters: any[] = []) {
    const names = getServiceNames(deps);

    const services = names.map(name => {
      if (name in this.instances) {
        return this.instances[name];
      }

      let instance = this.build(name, parameters);
      this.getExtenders(name).forEach((extender: ExtendClosure) => {
        instance = extender(instance, this);
      });

      // @todo Middleware process.
      // @todo 处理 __GLOBAL 的middleware
      applyMiddlewares(this.getMiddlewares(name), instance);

      if (this.isSingleton(name)) {
        this.instances[name] = instance;
      }
      // @todo if is not singleton, resolved may be always false;
      this.resolved[name] = true;
      return instance;
    });

    func.apply(null, services);
  }

  /*
  public make(make: string, parameters = []){
    return this.resolve(name, parameters);
  }
  */

  /**
   * Check if the given name has been resolved.
   * @param name
   */
  public isResolved(name): boolean {
    return this.resolved.hasOwnProperty(name) || this.instances.hasOwnProperty(name);
  }

  /**
   * Check the given service is a singleton.
   * @param name
   */
  public isSingleton(name: string): boolean {
    return this.instances.hasOwnProperty(name) || Boolean(this.bindings[name].singleton);
  }

  public destroy() {
    this.instances = {};
    this.tags = {};
    this.bindings = {};
    this.resolved = {};
    this.extenders = {};
  }

  protected rebound(name) {
    // const instance = this.make(abstract);
    this.make(name);
  }

  protected build(name: string, parameters: any[] = []) {
    if (!this.bindings.hasOwnProperty(name)) {
      throw new Error(`Service ${name} is not exists.`);
    }
    const instance = this.bindings[name].factory.apply(null, parameters);
    return instance;
  }

  protected getExtenders(name: string): ExtendClosure[] {
    return this.extenders[name] || [];
  }

  protected getMiddlewares(name: string): Function[] {
    return this.middlewares[name] || [];
  }
}
