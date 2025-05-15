export class IncorrectUsernameOrPassword extends Error {
  constructor() {
    super('Email ou senha estão incorretos')
  }
}