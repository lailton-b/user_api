const express = require('express');
const HomeController = require('../controllers/HomeController');
const UserController = require('../controllers/UserController');
const AdminAuth = require('../middleware/AdminAuth');

const router = express.Router();

/* GET */
router.get('/', HomeController.index);
router.get('/user', AdminAuth, UserController.index);
router.get('/user/:id', AdminAuth, UserController.findUser);

/* POST */
router.post('/user', UserController.create);
router.post('/recoverpassword', UserController.recoverPassword);
router.post('/login', UserController.login);

/* PUT */
router.put('/user', AdminAuth, UserController.update);
router.put('/changepassword', UserController.changePassword);

/* DELETE */
router.delete('/user/:id', AdminAuth, UserController.delete);

module.exports = router;
