'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controllers/hospital-controller');


router.get('/',controller.get);
router.get('/:registro',controller.getById);
router.get('/recursos/:recursos',controller.getRecursos);
router.post('/',controller.post);
router.put('/:id',controller.put);

module.exports = router;