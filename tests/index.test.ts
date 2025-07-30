import { main } from '../src/index';

describe('main', () => {
  it('should be a function', () => {
    expect(typeof main).toBe('function');
  });

  it('should log hello message', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    main();
    expect(consoleSpy).toHaveBeenCalledWith('Hello from 99tech!');
    consoleSpy.mockRestore();
  });
});
