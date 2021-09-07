const express = require('express');
const router = express.Router();
const app = require('../../app');

router.get('/', (req, res, next) => {
    res.render('admin/error');
});

module.exports = router;