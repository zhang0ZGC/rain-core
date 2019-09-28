import {ServiceProvider} from "../../src/ServiceProvider";

export class TestService {
  random(){
    return Math.random();
  }
}

export class Greet {
  greeting(name){
    return `Hello ${name}`;
  }
}

class TestServiceProvider extends ServiceProvider{
  public boot(): void {

  }

  public register(): void {
    this.kernel.bind('test', () => new TestService);

    this.kernel.bind('greet', () => new Greet);
    this.kernel.singleton('greet2', () => new Greet);
  }

  public destroy() {
    console.log('destroy TestServiceProvider');
    super.destroy();
  }
}

export default TestServiceProvider;
