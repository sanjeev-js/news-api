export function asyncWrap(promise: any) {
  return promise.then((result: any) => [null, result]).catch((err: any) => [err]);
}
