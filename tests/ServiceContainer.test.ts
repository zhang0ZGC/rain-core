import ServiceContainer from "../src/ServiceContainer";
import { ServiceProvider } from "../src/ServiceProvider";

class Test{
    public hello(name){
        return `Hello ${name}`;
    }
}
class TestBind extends Test{}
class TestSingleton extends Test{}
class TestInstance extends Test{}

describe("ServiceContainer Test", () => {
    class Container extends ServiceContainer{}
    let container: ServiceContainer;
    beforeAll(()=>{
        container = new Container();
        container.bind('bind', () => new TestBind());
        container.singleton('singleton', () => new TestSingleton());
        container.instance('instance', new TestInstance);
    });

    test("Test bind.", () => {
        expect(container.has('bind')).toBeTruthy();
        let service;
        container.resolve('bind', bind => {
            service = bind;
            expect(bind.hello('XM')).toBe('Hello XM');
        });
        container.resolve('bind', bind => {

            expect(bind).toStrictEqual(service);
        })
    });

    test("Test singleton.", () => {
        expect(container.has('singleton')).toBeTruthy();
    });

    test("Test instance.", () => {
        expect(container.has('instance')).toBeTruthy();
    })
});
