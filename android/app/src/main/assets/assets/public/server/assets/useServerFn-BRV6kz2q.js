import { M as useRouter, r as reactExports, b as isRedirect } from "./worker-entry-CFvqOeOX.js";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(
    async (...args) => {
      try {
        const res = await serverFn(...args);
        if (isRedirect(res)) throw res;
        return res;
      } catch (err) {
        if (isRedirect(err)) {
          err.options._fromLocation = router.stores.location.get();
          return router.navigate(router.resolveRedirect(err).options);
        }
        throw err;
      }
    },
    [router, serverFn],
  );
}
export { useServerFn as u };
