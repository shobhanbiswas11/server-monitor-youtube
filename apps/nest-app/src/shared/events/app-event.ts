export abstract class AppEvent<T = any> {
  constructor(public payload: T) {}
}
