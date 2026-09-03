import isInstanceOf from '../TypeGuard';

class Foo {}
class Bar {}

describe('isInstanceOf', () => {
    it('should return true when the value is an instance of the given class', () => {
        expect(isInstanceOf(new Foo(), Foo)).toBe(true);
    });

    it('should return false when the value is not an instance of the given class', () => {
        expect(isInstanceOf(new Bar(), Foo)).toBe(false);
    });

    it('should return false for primitive values', () => {
        expect(isInstanceOf('a string', Foo)).toBe(false);
    });
});
