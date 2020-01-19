'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/* global Reflect, Promise */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;

  for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];

  return r;
}

var getServiceNames = function (name) {
    return Array.isArray(name) ? name : String(name).replace(/\s+/g, '').split(',');
};
function applyMiddlewares(middlewares, instance) {
    if (middlewares.length) {
        var idx_1 = 0;
        var next_1 = function nextMiddleware(err) {
            if (err) {
                throw err;
            }
            if (middlewares[idx_1]) {
                middlewares[idx_1++].call(null, instance, next_1);
            }
        };
        next_1();
    }
    return instance;
}
var ServiceContainer = /** @class */ (function () {
    function ServiceContainer() {
        /**
         * The container's shared instances.
         */
        this.instances = {};
        /**
         * The container's bindings.
         */
        this.bindings = {};
        /**
         * Registered object alias.
         */
        // protected alias: { [key: string]: string[] } = {};
        /**
         * Tags of registered services.
         */
        this.tags = {};
        /**
         * A map of the types that have been resolved.
         */
        this.resolved = {};
        /**
         * The extend closures of services.
         */
        this.extenders = {};
        /**
         * Middlewares of services.
         */
        this.middlewares = {};
    }
    /**
     * @inheritDoc
     * @param id
     */
    ServiceContainer.prototype.get = function (id) {
    };
    /**
     * Check if given name has been registered.
     * @param id
     */
    ServiceContainer.prototype.has = function (id) {
        // return id in this.instances || id in this.bindings;
        return this.instances.hasOwnProperty(id) || this.bindings.hasOwnProperty(id);
    };
    /**
     * Register an existing instance or a function that return the instance as shared in the container.
     * @param name
     * @param {FactoryFunction} factory
     */
    ServiceContainer.prototype.instance = function (name, factory) {
        var instance = typeof factory === 'function' ? factory.call({}) : factory;
        this.instances[name] = instance;
        return instance;
    };
    /**
     * Register a shared binding in the container.
     * The difference of *signleton* and *instance* method is *signleton* only receive factory function,
     * but *instance* can also receive a constructed instance.
     * @param abstract
     * @param {FactoryFunction} factory
     */
    ServiceContainer.prototype.singleton = function (abstract, factory) {
        this.bind(abstract, factory, true);
    };
    /**
     * Register a binding with the container.
     * @param {String} abstract
     * @param {FactoryFunction} factory
     * @param {Boolean} singleton
     */
    ServiceContainer.prototype.bind = function (abstract, factory, singleton) {
        if (singleton === void 0) { singleton = false; }
        // drop stale instance
        delete this.instances[abstract];
        // todo: If factory is not a function, create a closure that return it
        this.bindings[abstract] = {
            factory: factory,
            singleton: singleton,
        };
        // If the abstract type was already resolved in the container, rebound and replace it.
        if (this.isResolved(abstract)) {
            this.rebound(abstract);
        }
    };
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
    ServiceContainer.prototype.extend = function (name, closure) {
        if (name in this.instances) {
            // If instance is already exists, replace.
            this.instances[name] = closure(this.instances[name], this);
        }
        else {
            // Else store closure in extenders, then execute it when the service is construct.
            if (!this.extenders.hasOwnProperty(name)) {
                this.extenders[name] = [];
            }
            this.extenders[name].push(closure);
            if (this.isResolved(name)) {
                this.rebound(name);
            }
        }
    };
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
    ServiceContainer.prototype.middleware = function (name, func) {
        if (typeof name === 'function') {
            func = name;
            name = '__GLOBAL';
        }
        // @todo Support nested service name 支持循环嵌套的service name
        if (!this.middlewares) {
            this.middlewares[name] = [];
        }
        this.middlewares[name].push(func);
        return this;
    };
    /**
     * Assign tag|tags to bound object(s).
     *
     * @param name
     * @param tags
     */
    ServiceContainer.prototype.tag = function (name, tags) {
        var _this = this;
        var tarArr = [];
        if (tags instanceof Array) {
            tarArr = tags;
        }
        else {
            for (var i = 1; i < arguments.length; i++) {
                tarArr[i - 1] = arguments[i];
            }
        }
        tarArr.forEach(function (tag) {
            if (!(tag in _this.tags)) {
                _this.tags[tag] = [];
            }
            if (name instanceof Array) {
                name.forEach(function (item) {
                    _this.tags[tag].push(item);
                });
            }
            else {
                _this.tags[tag].push(name);
            }
        });
    };
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
    ServiceContainer.prototype.make = function (deps) {
        var _this = this;
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        return new Promise((function (resolve, reject) {
            var names = getServiceNames(deps);
            function resolveDeps() {
                if (Array.isArray(deps) || names.length > 1) {
                    // const obj = {};
                    var arr = [];
                    for (var i = 0; i < names.length; i++) {
                        // obj[names[i]] = arguments[i];
                        arr.push(arguments[i]);
                    }
                    // resolve(obj);
                    resolve(arr);
                }
                else {
                    resolve(arguments[0]);
                }
            }
            try {
                _this.resolve.apply(_this, __spreadArrays([names, resolveDeps], arg));
            }
            catch (e) {
                reject(e);
            }
        }));
    };
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
    ServiceContainer.prototype.resolve = function (deps, func, parameters) {
        var _this = this;
        if (parameters === void 0) { parameters = []; }
        var names = getServiceNames(deps);
        var services = names.map(function (name) {
            if (name in _this.instances) {
                return _this.instances[name];
            }
            var instance = _this.build(name, parameters);
            _this.getExtenders(name).forEach(function (extender) {
                instance = extender(instance, _this);
            });
            // @todo Middleware process.
            // @todo 处理 __GLOBAL 的middleware
            applyMiddlewares(_this.getMiddlewares(name), instance);
            if (_this.isSingleton(name)) {
                _this.instances[name] = instance;
            }
            // @todo if is not singleton, resolved may be always false;
            _this.resolved[name] = true;
            return instance;
        });
        func.apply(null, services);
    };
    /*
    public make(make: string, parameters = []){
      return this.resolve(name, parameters);
    }
    */
    /**
     * Check if the given name has been resolved.
     * @param name
     */
    ServiceContainer.prototype.isResolved = function (name) {
        return this.resolved.hasOwnProperty(name) || this.instances.hasOwnProperty(name);
    };
    /**
     * Check the given service is a singleton.
     * @param name
     */
    ServiceContainer.prototype.isSingleton = function (name) {
        return this.instances.hasOwnProperty(name) || Boolean(this.bindings[name].singleton);
    };
    ServiceContainer.prototype.destroy = function () {
        this.instances = {};
        this.tags = {};
        this.bindings = {};
        this.resolved = {};
        this.extenders = {};
    };
    ServiceContainer.prototype.rebound = function (name) {
        // const instance = this.make(abstract);
        this.make(name);
    };
    ServiceContainer.prototype.build = function (name, parameters) {
        if (parameters === void 0) { parameters = []; }
        if (!this.bindings.hasOwnProperty(name)) {
            throw new Error("Service " + name + " is not exists.");
        }
        var instance = this.bindings[name].factory.apply(null, parameters);
        return instance;
    };
    ServiceContainer.prototype.getExtenders = function (name) {
        return this.extenders[name] || [];
    };
    ServiceContainer.prototype.getMiddlewares = function (name) {
        return this.middlewares[name] || [];
    };
    return ServiceContainer;
}());

function getListenerIndex(listeners, listener) {
    var l = listeners.length;
    while (l--) {
        if (listeners[l].listener === listener) {
            return l;
        }
    }
    return -1;
}
var EventDispatcher = /** @class */ (function () {
    function EventDispatcher() {
        this.listeners = {};
    }
    /**
     * Dispatch an event.
     * @param eventName
     * @param args
     */
    EventDispatcher.prototype.dispatch = function (eventName, args) {
        if (eventName in this.listeners) {
            var listeners = this.listeners[eventName];
            this.callListeners(listeners, eventName, args);
        }
        return this;
    };
    /**
     * Dispatch an event.
     * Unlike dispatch, emit passes the remaining parameters instead of an array.
     * @param eventName
     * @param args
     */
    EventDispatcher.prototype.emit = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // const _args = Array.prototype.slice.call(arguments, 1);
        return this.dispatch(eventName, args);
    };
    /**
     * Alias of addListener.
     * @param eventName
     * @param listener
     * @param once
     */
    EventDispatcher.prototype.on = function (eventName, listener, once) {
        if (once === void 0) { once = false; }
        return this.addListener(eventName, listener, once);
    };
    /**
     * Alias of addListener(eventName, listener, true)
     * @param eventName
     * @param listener
     */
    EventDispatcher.prototype.once = function (eventName, listener) {
        return this.addListener(eventName, listener, true);
    };
    /**
     * Alias of removeListener.
     * @param eventName
     * @param listener
     */
    EventDispatcher.prototype.off = function (eventName, listener) {
        if (listener)
            return this.removeListener(eventName, listener);
        else
            return this;
    };
    /**
     * Add event listener.
     * @param eventName
     * @param listener
     * @param once
     */
    EventDispatcher.prototype.addListener = function (eventName, listener, once) {
        if (once === void 0) { once = false; }
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
            listener: listener,
            once: once
        });
        return this;
    };
    /**
     * Remove event listener.
     * @param eventName
     * @param listener
     */
    EventDispatcher.prototype.removeListener = function (eventName, listener) {
        var arr = this.listeners[eventName];
        if (!arr || arr.length === 0)
            return this;
        var idx = getListenerIndex(arr, listener);
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
    };
    /**
     * Remove part listeners bound to eventName / all listeners of eventName / all listeners.
     * @param eventName
     * @param listeners
     */
    EventDispatcher.prototype.removeListeners = function (eventName, listeners) {
        if (eventName && this.listeners[eventName]) {
            // filter compatibility： IE>=9
            this.listeners[eventName] = listeners ? this.listeners[eventName].filter(function (item) { return listeners.indexOf(item.listener) === -1; }) : [];
        }
        else {
            this.listeners = {};
        }
        return this;
    };
    /**
     * Check whether a event has binding listeners.
     * @param eventName
     */
    EventDispatcher.prototype.hasListeners = function (eventName) {
        if (eventName) {
            return this.listeners[eventName].length > 0;
        }
        return !!Object.keys(this.listeners).find(function (listener) { return Boolean(listener); });
    };
    /**
     * Get all listeners bound to the event.
     * @param eventName
     */
    EventDispatcher.prototype.getListeners = function (eventName) {
        if (eventName) {
            return this.listeners[eventName] || [];
        }
        return this.listeners;
    };
    /**
     * Process event listeners.
     * @param listeners
     * @param eventName
     * @param args
     */
    EventDispatcher.prototype.callListeners = function (listeners, eventName, args) {
        var _this = this;
        // listeners = Array.prototype.slice.call(listeners);
        // const defer = typeof Promise === 'function' ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout;
        var process = function () {
            var listener;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var result;
            var start = +new Date();
            while ((listener = listeners.shift())) {
                if (listener.once) {
                    _this.removeListener(eventName, listener.listener);
                }
                // If result===false, stop listener call
                result = listener.listener.apply(_this, args || []);
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
    };
    return EventDispatcher;
}());

var Kernel = /** @class */ (function (_super) {
    __extends(Kernel, _super);
    function Kernel(debug) {
        if (debug === void 0) { debug = false; }
        var _this = _super.call(this) || this;
        /**
         * A set of ServiceProvider
         */
        _this.serviceProviders = [];
        _this.booted = false;
        _this.debug = !!debug;
        _this.dispatcher = new EventDispatcher();
        // this.instance('kernel', this);
        // this.instance('container', this);
        _this.registerBaseServiceProvider();
        return _this;
    }
    Kernel.prototype.boot = function () {
        var _this = this;
        if (this.booted) {
            return Promise.resolve(true);
        }
        this.resolveProviderRegister();
        this.serviceProviders.forEach(function (provider) {
            _this.bootProvider(provider.provider);
        });
        this.startTime = new Date();
        this.booted = true;
        console.log(new Date().toLocaleTimeString(), 'Kernel Booted');
        return Promise.resolve(true);
    };
    /**
     * Register service provider
     * @todo It seems more suitable to change the name to `provider`, or `registerProvider`?
     * @param {ServiceProviderInterface} Provider
     * @param options
     */
    Kernel.prototype.register = function (Provider, options) {
        if (options === void 0) { options = {}; }
        var provider = typeof Provider === 'object' ? Provider : new Provider(this, options.args);
        /*
        try{
          provider.register();
        }catch (e) {
          console.warn(e);
        }
        */
        this.serviceProviders.push({
            provider: provider,
            options: options,
        });
        if (this.booted) {
            provider.register();
            this.bootProvider(provider);
        }
        return provider;
    };
    Kernel.prototype.destroy = function () {
        // Object.getOwnPropertyNames(this).forEach(key => this[key] = null);
        this.serviceProviders.forEach(function (item) { return item.provider.destroy(); });
        this.serviceProviders = [];
        _super.prototype.destroy.call(this);
    };
    Kernel.prototype.isBooted = function () {
        return this.booted;
    };
    /**
     * @deprecated
     * Register base service provider.
     * e.g. Event, Router, Logger ,etc
     */
    Kernel.prototype.registerBaseServiceProvider = function () {
        console.warn('registerBaseServerProvider method is deprecated.');
    };
    /**
     * Register services
     */
    Kernel.prototype.resolveProviderRegister = function () {
        this.serviceProviders.forEach(function (item) {
            item.provider.register();
        });
    };
    /**
     * Boot the given service provider.
     * @param provider
     */
    Kernel.prototype.bootProvider = function (provider) {
        // provider.boot.call(this);
        provider.boot();
    };
    Kernel.prototype.initBundles = function () {
    };
    Kernel.VERSION = '1.0.0';
    Kernel.VERSION_ID = 10000;
    return Kernel;
}(ServiceContainer));
Object.freeze(Kernel);

/**
 * Kernel初始化时会先调用register完成某些服务的注册绑定
 * 所有ServiceProvider的register()方法调用完成后，
 * 再调用他们的boot()方法(可在kernel初始化的最后一步kernel.boot()中实现)
 * 在boot方法中可以使用已注册的所有服务
 * @see https://learnku.com/articles/6189/laravel-service-provider-detailed-concept
 */
var ServiceProvider = /** @class */ (function () {
    function ServiceProvider(kernel, options) {
        if (options === void 0) { options = {}; }
        this.kernel = kernel;
        this.options = options;
        this.kernel = kernel;
    }
    /**
     * $ explore #1
     * 在浏览器环境下不一定好用，因为动态加载文件都是异步的
     *
     * 获取提供器提供的服务
     * 一般情况下不需要此方法，但是当provider标记为延迟加载服务时（defer属性？）
     * 只有获取相关服务 （e.g. `kernel.make('b')`, b 为provides返回的值）时，才会加载此ServiceProvider
     * 例：
     * kernel.make('hash')
     * 相当于告诉kernel使用hash service时，我这里有hash服务，我会自动帮你加载哦~
     *
     * $ explore #2
     * 提供延迟属性， 提供服务名称及对应的文件地址， 在引用相关的服务时，动态加载相关文件
     */
    ServiceProvider.prototype.provides = function () {
        return [];
    };
    ServiceProvider.prototype.destroy = function () {
        this.kernel = null;
    };
    return ServiceProvider;
}());

exports.Kernel = Kernel;
exports.ServiceProvider = ServiceProvider;
