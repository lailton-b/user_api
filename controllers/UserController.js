const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const PasswordToken = require('../models/PasswordToken');
const User = require('../models/User');

const secret = 'tKB9XPD%GOW%DRxIZ9WW0TGfDK0ac0';

class UserController {
  // GET ALL USERS
  async index(req, res) {
    const users = await User.findAll();

    if (users.length) res.json(users);
    else res.status(200).json([]);
  }

  // GET USER BY ID
  async findUser(req, res) {
    const id = req.params.id;

    if (!isNaN(id)) {
      const user = await User.findById(id);

      if (user) res.json(user);
      else {
        res.status(404).json({ error: 'Nenhum usuário correspondente ao id.' });
      }
    } else {
      res.status(400).json({ error: 'O id precisa ser um número.' });
    }
  }

  // CREATE A NEW USER
  async create(req, res) {
    const { name, email, password } = req.body;

    if (name === undefined) {
      res.status(400).json('Nome não pode estar vazio.');
      return;
    }
    if (email === undefined) {
      res.status(400).json('E-mail não pode estar vazio.');
      return;
    }
    if (password === undefined) {
      res.status(400).json('A senha não pode estar vazia.');
      return;
    }

    if (name && email && password) {
      try {
        const emailExists = await User.findEmail(email);

        if (emailExists) {
          res.status(409).json('E-mail já cadastrado.');
          return;
        } else {
          await User.newUser(name, email, password);
          res.status(201).json('Cadastrado com sucesso.');
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  // UPDATE AN EXISTING USER
  async update(req, res) {
    const { id, name, email, role } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: 'ID deve ser um número.' });
    } else if (role && isNaN(role)) {
      res.status(400).json({ error: 'Role deve ser um número.' });
    } else {
      const result = await User.updateUser(id, name, email, role);

      if (result === true) res.sendStatus(200);
      else if (result === false)
        res.status(400).json({ error: 'E-mail já cadastrado.' });
      else if (result === undefined)
        res.status(404).json({ error: 'Nenhum usuário correspondente ao ID.' });
      else if (result === null)
        res.status(500).json({ error: 'Erro ao atualizar o usuário' });
    }
  }

  // DELETE AN USER BY ID
  async delete(req, res) {
    const id = req.params.id;

    if (id === undefined) {
      res.status(400).json('O id não pode estar vazio.');
    } else if (isNaN(id)) {
      res.status(400).json('O id precisa ser um número.');
    } else {
      const { status, json } = await User.deleteUser(id);
      res.status(status).json(json);
    }
  }

  // RETURN A TOKEN SO YOU CAN RECOVER YOUR PASSWORD
  async recoverPassword(req, res) {
    const email = req.body.email;

    if (email !== undefined) {
      const result = await PasswordToken.create(email);

      return result.boolean
        ? res.status(result.status).send('' + result.token)
        : res.status(result.status).json(result.json);
    } else {
      res.status(400).json('O email não pode estar vazio.');
    }
  }

  // CHANGE PASSWORD
  async changePassword(req, res) {
    const token = req.body.token;
    const password = req.body.password;

    if (token !== undefined) {
      const validate = await PasswordToken.validate(token);

      if (validate.boolean) {
        const update = await User.updatePassword(validate.token, password);
        return update.boolean
          ? res.status(update.status).json(update.json)
          : res.status(update.status).json(update.json);
      } else {
        res.status(validate.status).json(validate.json);
      }
    } else {
      res.status(400).json('O token não pode estar vazio.');
    }
  }

  // LOGIN
  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (email === undefined) {
      res.status(400).json('O email não pode estar vazio.');
    } else if (password === undefined) {
      res.status(400).json('A senha não pode estar vazia.');
    } else {
      if (user !== undefined) {
        const result = await bcrypt.compare('' + password, '' + user.password);
        return result
          ? res.status(200).json({
              token: jwt.sign({ email: user.email, role: user.role }, secret),
            })
          : res.status(406).json('Senha incorreta.');
      } else {
        res.status(404).json('Nenhum usuário correspondente ao email.');
      }
    }
  }
}

module.exports = new UserController();
