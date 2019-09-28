'use strict';
import {ServiceProviderInterface, ServiceProviderConstructor} from "./ServiceProvider";
import ServiceContainer, { ContainerInterface } from "./ServiceContainer";
import EventDispatcher from './EventDispatcher';


export interface KernelInterface extends ContainerInterface{
  // constructor(debug: boolean);
  boot(): Promise<any>;
  register(provider: ServiceProviderConstructor | ServiceProviderInterface, options?:{}): ServiceProviderInterface;
  isBooted(): boolean;
  destroy(): void;
}

export interface KernelConstructor {
  new (): KernelInterface;
  readonly prototype: KernelInterface;
}


class Kernel extends ServiceContainer implements KernelInterface{
  static VERSION = '1.0.0';
  static VERSION_ID= 10000;

  /**
   * A set of ServiceProvider
   */
  protected serviceProviders: {provider: ServiceProviderInterface, options: any}[] = [];

  protected startTime: Date;
  protected booted: boolean = false;
  protected debug: boolean;

  public dispatcher: EventDispatcher;

  constructor(debug: boolean = false){
    super();
    this.debug = debug;

    this.dispatcher = new EventDispatcher();

    // this.instance('kernel', this);
    // this.instance('container', this);

    this.registerBaseServiceProvider();
  }

  public boot(): Promise<any>{
    if (this.booted){
      return Promise.resolve(true);
    }

    this.resolveProviderRegister();

    this.serviceProviders.forEach(provider => {
      this.bootProvider(provider.provider);
    });

    this.startTime = new Date();
    this.booted = true;

    console.log(new Date().toLocaleTimeString(), 'Kernel Booted');
    return Promise.resolve(true);
  }

  /**
   * Register service provider
   * @param {ServiceProviderInterface} Provider
   * @param options
   */
  public register(Provider: ServiceProviderConstructor | ServiceProviderInterface, options: {args?: any}={}) {
    const provider: ServiceProviderInterface = typeof Provider === 'object' ? Provider : new Provider(this, options.args);

    /*
    try{
      provider.register();
    }catch (e) {
      console.warn(e);
    }
    */

    this.serviceProviders.push({
      provider: provider,
      options,
    });

    if (this.booted){
      provider.register();
      this.bootProvider(provider);
    }
    return provider;
  }

  public destroy(): void{
    // Object.getOwnPropertyNames(this).forEach(key => this[key] = null);
    this.serviceProviders.forEach(item => item.provider.destroy());
    this.serviceProviders = [];

    super.destroy();
  }

  public isBooted(): boolean{
    return this.booted;
  }

  /**
   * @deprecated
   * Register base service provider.
   * e.g. Event, Router, Logger ,etc
   */
  protected registerBaseServiceProvider(){

  }

  /**
   * Register services
   */
  protected resolveProviderRegister(){
    this.serviceProviders.forEach(item => {
      item.provider.register();
    });
  }

  /**
   * Boot the given service provider.
   * @param provider
   */
  protected bootProvider(provider: ServiceProviderInterface){
    if ('boot' in provider){
      // provider.boot.call(this);
      provider.boot();
    }
  }

  private initBundles(){

  }

}
Object.freeze(Kernel);
export default Kernel;
