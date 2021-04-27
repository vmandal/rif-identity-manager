  interface ServiceInit {
    status: 'init';
  }
  interface ServiceLoading {
    status: 'loading';
  }
  interface ServiceLoaded<T> {
    status: 'loaded';
    payload: T;
  }
  interface ServiceError {
    status: 'error';
    error: Error;
  }

export type WebServiceInterface<T> =
    | ServiceInit
    | ServiceLoading
    | ServiceLoaded<T>
    | ServiceError;
