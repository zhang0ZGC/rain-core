import { ServiceProviderInterface, ServiceProviderConstructor } from "./ServiceProvider";
import ServiceContainer, { ContainerInterface } from "./ServiceContainer";
import EventDispatcher from './EventDispatcher';
export interface KernelInterface extends ContainerInterface {
    boot(): Promise<any>;
    register(provider: ServiceProviderConstructor | ServiceProviderInterface, options?: {}): ServiceProviderInterface;
    isBooted(): boolean;
    destroy(): void;
}
export interface KernelConstructor {
    new (): KernelInterface;
    readonly prototype: KernelInterface;
}
declare class Kernel extends ServiceContainer implements KernelInterface {
    static VERSION: string;
    static VERSION_ID: number;
    /**
     * A set of ServiceProvider
     */
    protected serviceProviders: {
        provider: ServiceProviderInterface;
        options: any;
    }[];
    protected startTime: Date;
    protected booted: boolean;
    protected debug: boolean;
    dispatcher: EventDispatcher;
    constructor(debug?: boolean);
    boot(): Promise<any>;
    /**
     * Register service provider
     * @todo It seems more suitable to change the name to `provider`, or `registerProvider`?
     * @param {ServiceProviderInterface} Provider
     * @param options
     */
    register(Provider: ServiceProviderConstructor | ServiceProviderInterface, options?: {
        args?: any;
    }): ServiceProviderInterface;
    destroy(): void;
    isBooted(): boolean;
    /**
     * @deprecated
     * Register base service provider.
     * e.g. Event, Router, Logger ,etc
     */
    protected registerBaseServiceProvider(): void;
    /**
     * Register services
     */
    protected resolveProviderRegister(): void;
    /**
     * Boot the given service provider.
     * @param provider
     */
    protected bootProvider(provider: ServiceProviderInterface): void;
    private initBundles;
}
export default Kernel;
