import {Kernel} from '../src'
import { CoreServiceProvider, TestServiceProvider } from "./providers";
import {KernelInterface} from "../src/Kernel";
import {Greet, TestService} from "./providers/TestProvider";

describe("Kernel", () => {
  let kernel: KernelInterface;
  beforeAll((done) => {
    kernel = new Kernel(false);

    kernel.register(CoreServiceProvider);

    // register a object struct provider
    kernel.register({
      kernel: kernel,
      register(): void {
      },
      boot(): void {
      },
      destroy() {
      }
    });

    kernel.boot().then((result) => {
      expect(result).toBeTruthy();
      expect(kernel.isBooted()).toBeTruthy();
      done();
    });
  });

  test('Test kernel', () => {
    expect(kernel).toBeInstanceOf(Kernel);
  });

  test('Register service after booted', () => {
    expect(kernel.has('test')).toBeFalsy();
    kernel.register(TestServiceProvider);
    expect(kernel.has('test')).not.toBeFalsy();
  });

  test('Kernel boot again', done => {
    kernel.boot().then((result) => {
      expect(result).toBeTruthy();
      done();
    });
  });

  test('Test services', async () => {
    const testService: TestService = await kernel.make('test');
    const greetService: Greet = await kernel.make('greet');

    expect(testService.random()).toBeGreaterThan(0);
    expect(greetService.greeting('XM')).toEqual('Hello XM');

    let service;
    service = await kernel.make('greet2');
    expect(service.greeting('XM')).toEqual('Hello XM');
    // call exists method
    service = await kernel.make('greet2');
    expect(service.greeting('XM')).toEqual('Hello XM');
  });

  test('Test not exists service', () => {
    function getService(){
      kernel.resolve('notExistsService', (service) => {

      })
    }
    // expect(getService).toThrow('Service notExistsService is not exists.');
    // expect(kernel.make('notExistsService')).rejects.toMatch('Service notExistsService is not exists.')
    expect(kernel.make('notExistsService')).rejects.toThrow('Service notExistsService is not exists.')
  });

  test('Kernel destroy', () => {
    kernel.destroy();
    expect(kernel.has('test')).toBeFalsy();
  });
});
