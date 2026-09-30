import { displayHost, pluralize } from '@/utils/formatters';

describe('formatters', () => {
  it('displayHost strips protocol, path and www', () => {
    expect(displayHost('https://www.example.com/about?x=1')).toBe('example.com');
  });

  it('displayHost returns the input when it is not a URL', () => {
    expect(displayHost('not a url')).toBe('not a url');
  });

  it('pluralize picks the right word form', () => {
    expect(pluralize(1, 'page')).toBe('1 page');
    expect(pluralize(3, 'page')).toBe('3 pages');
  });
});
