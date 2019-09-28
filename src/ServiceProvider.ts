import Kernel, {KernelInterface} from "./Kernel";

export interface ServiceProviderInterface {
  /**
   * Kernel instance
   */
  kernel: KernelInterface;

  // new(kernel: KernelInterface, args): ServiceProviderInterface;

  // constructor(kernel: KernelInterface, args: any);
  /**
   * 注册服务
   */
  register(): void;

  boot(): void;

  destroy(): void;
}

export interface ServiceProviderConstructor {
  new (kernel: KernelInterface, args): ServiceProviderInterface;
  readonly prototype: ServiceProviderInterface;
}

/**
 * Kernel初始化时会先调用register完成某些服务的注册绑定
 * 所有ServiceProvider的register()方法调用完成后，
 * 再调用他们的boot()方法(可在kernel初始化的最后一步kernel.boot()中实现)
 * 在boot方法中可以使用已注册的所有服务
 * @see https://learnku.com/articles/6189/laravel-service-provider-detailed-concept
 */
export abstract class ServiceProvider implements ServiceProviderInterface{

  constructor(public kernel: Kernel, args?) {
    this.kernel = kernel;
  }

  /**
   * 注册服务
   * 在容器中注册绑定
   */
  public abstract register(): void;

  /**
   * 引导服务
   * 引导方法
   * 此方法在所有服务都注册后调用， 此时可以随意使用已注册的所有服务
   */
  public abstract boot(): void;

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
  public provides(): [] {
    return [];
  }

  public destroy() {
    this.kernel = null;
  }
}
