interface SortFunctions<T> {
  [key: string]: (a: T, b: T) => number
}

export function createSortFunctions<T extends { [key: string]: any }>(names: string[]): SortFunctions<T> {
  const s = {} as SortFunctions<T>
  names.forEach((name) => {
    s[name] = (a: T, b: T) => {
      if (a[name] > b[name])
        return 1
      if (a[name] < b[name])
        return -1
      return 0
    }
  })
  return s
}
