const knex = require('../database/connection');
const bcrypt = require('bcrypt');
const PasswordToken = require('./PasswordToken');

class User {
  // FIND ALL USERS
  async findAll() {
    try {
      const users = knex.select(['id', 'name', 'email', 'role']).from('users');
      if (users) return users;
    } catch (error) {
      return [];
    }
  }

  // FIND USER BY ID
  async findById(id) {
    try {
      const user = await knex
        .select(['id', 'name', 'email', 'role'])
        .from('users')
        .where({ id: id });
      if (user.length) return user[0];
      else return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  // FIND USER BY EMAIL
  async findByEmail(email) {
    try {
      const user = await knex.select().from('users').where({ email: email });
      if (user.length) return user[0];
      else return undefined;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  // RETURN IF EMAIL EXISTS
  async findEmail(email) {
    try {
      const emailExists = await knex
        .select()
        .from('users')
        .where({ email: email });

      if (emailExists.length) return true;
      else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // ADD A NEW USER
  async newUser(name, email, password) {
    try {
      const hash = await bcrypt.hash('' + password, 10);
      await knex
        .insert({ name, email, password: hash, role: 0 })
        .table('users');
    } catch (error) {
      console.log(error);
    }
  }

  // UPDATE USER
  async updateUser(id, name, email, role) {
    const user = await this.findById(id);
    let emailExists = false;

    if (user) {
      if (email && email !== user.email) {
        emailExists = await this.findEmail(email);
      }

      if (!emailExists) {
        try {
          if (name === undefined) name = user.name;
          if (email === undefined) email = user.email;
          if (role === undefined) role = user.role;

          await knex
            .update({ name, email, role })
            .table('users')
            .where({ id: id });

          return true;
        } catch (error) {
          console.log(error);
          return null;
        }
      } else {
        return false;
      }
    } else {
      return undefined;
    }
  }

  // DELETE USER
  async deleteUser(id) {
    const user = await this.findById(id);

    if (user) {
      try {
        const result = await knex.delete().from('users').where({ id: id });
        if (result)
          return {
            status: 200,
            json: 'Usuário deletado com sucesso.',
          };
        else
          return {
            status: 500,
            json: 'Alguma coisa deu errado durante a exclusão.',
          };
      } catch (error) {
        return {
          status: 500,
          json: 'Alguma coisa deu errado durante a exclusão.',
        };
      }
    } else {
      return {
        status: 404,
        json: 'Nenhum usuário correspondente ao id.',
      };
    }
  }

  // UPDATE PASSWORD
  async updatePassword(token, password) {
    if (password === undefined) {
      return {
        boolean: false,
        status: 400,
        json: 'A senha não pode estar vazia.',
      };
    } else if (token === undefined) {
      return {
        boolean: false,
        status: 400,
        json: 'O token não pode estar vazio.',
      };
    } else {
      try {
        const hash = await bcrypt.hash('' + password, 10);

        if (token.used === 0) {
          await PasswordToken.setUsed(token);

          const result = await knex
            .update({ password: hash })
            .table('users')
            .where({ id: token.user_id });

          if (result) {
            return {
              boolean: true,
              status: 200,
              json: 'Senha alterada com sucesso.',
            };
          }
        } else
          return {
            boolean: false,
            status: 410,
            json: 'Esse token já foi utilizado.',
          };
      } catch (error) {
        console.log(error);
        return {
          boolean: false,
          status: 500,
          json: 'Erro ao atualizar a senha.',
        };
      }
    }
  }
}

module.exports = new User();
