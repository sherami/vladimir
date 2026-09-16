// Local compatibility overload for heterogeneous readonly tuples used by the governed Evidence catalog.
// Keeps strict typechecking enabled while allowing the catalog to flatten into a common field shape.
interface ReadonlyArray<T> {
  flatMap(
    callbackfn: (value: T, index: number, array: readonly T[]) => { value: string; label: string; unit: string } | readonly { value: string; label: string; unit: string }[],
    thisArg?: unknown
  ): { value: string; label: string; unit: string }[];
}
