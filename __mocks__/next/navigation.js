// Manual mock for next/navigation
const push = jest.fn();
const replace = jest.fn();
const back = jest.fn();
const prefetch = jest.fn();
const refresh = jest.fn();

module.exports = {
  useRouter: () => ({
    push,
    replace,
    back,
    prefetch,
    refresh,
    pathname: "/",
    query: {},
    asPath: "/",
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
};
