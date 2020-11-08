const knex = require('../database/connection');
const User = require('../models/User');

class PasswordToken {
  // CREATE RECOVERY TOKEN
  async create(email) {
    const user = await User.findByEmail(email);

    if (user) {
      try {
        const token = Date.now();

        const result = await knex
          .insert({ token, user_id: user.id, used: 0 })
          .table('passwordtokens');

        return result
          ? { boolean: true, status: 200, token }
          : {
              boolean: false,
              status: 500,
              json: 'Erro durante a geração do token.',
            };
      } catch (error) {
        console.log(error);
        return {
          boolean: false,
          status: 500,
          json: 'Erro durante a geração do token.',
        };
      }
    } else {
      return {
        boolean: false,
        status: 404,
        json: 'Nenhum usuário correspondente ao E-mail.',
      };
    }
  }

  // VALIDATE TOKEN
  async validate(token) {
    if (token) {
      try {
        const result = await knex
          .select('*')
          .from('passwordtokens')
          .where({ token: token });

        return result.length
          ? { boolean: true, token: result[0] }
          : { boolean: false, status: 404, json: 'Token inválido.' };
      } catch (error) {
        console.log(error);
        return {
          boolean: false,
          status: 500,
          json: 'Erro ao validar o token.',
        };
      }
    } else {
      return { boolean: false, status: 410, json: 'Token não existente.' };
    }
  }

  // SET TOKEN AS USED
  static async setUsed(token) {
    if (token !== undefined) {
      try {
        const result = await knex
          .update({ used: 1 })
          .from('passwordtokens')
          .where({ token: token });

        if (result) return { boolean: true };
      } catch (error) {
        console.log(error);
      }
    } else {
      return {
        boolean: false,
        status: 400,
        json: 'O token não pode estar vazio.',
      };
    }
  }
}

module.exports = new PasswordToken();
