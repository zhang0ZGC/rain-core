import {ServiceProvider} from "../../src/ServiceProvider";


class CoreProvider extends ServiceProvider{
  public boot(): void {
    /*if (confirm('创建对象?')) {
      Object.assign(window, {RainOS: this.kernel});
    }*/
    if ('undefined' !== typeof window){
      Object.assign(window, {RainOS: this.kernel});
    }
  }

  public register(): void {

  }

  public destroy() {
    // @ts-ignore
    // window.RainOS = null;
    // @ts-ignore
    // console.log(window.RainOS);

    // this.kernel = null;
    super.destroy();
  }
}

export default CoreProvider;
