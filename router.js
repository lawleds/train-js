const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController.js')

router.get('/', userController.home)


module.exports = router;
