export class emailInAlreadyUse extends Error {
  constructor() {
    super('Este email ja esta em uso')
  }
}