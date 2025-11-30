const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'AlaSegura backend está funcionando' });
});

module.exports = router;