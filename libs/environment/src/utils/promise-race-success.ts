export function promiseRaceToSuccess<T>(requests: Array<Promise<T>>) {
  return new Promise<T>((resolve, reject) => {
    let hasResolved = false;
    const failures = [];

    requests.forEach((req) => {
      req
        .then((res) => {
          if (!hasResolved) {
            resolve(res);
            hasResolved = true;
          }
        })
        .catch((err) => {
          failures.push(err);
          if (failures.length === requests.length) {
            reject(err);
          }
        });
    });
  });
}
