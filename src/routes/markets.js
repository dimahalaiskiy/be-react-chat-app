const { Router } = require('express');

const router = Router();

const supermarkets = [
  { id: 1, store: 'Whole Foods', miles: 0.6 },
  { id: 2, store: 'Whole Foods', miles: 1.2 },
  { id: 3, store: 'Whole Foods', miles: 5 },
  { id: 4, store: 'Whole Foods', miles: 0.6 },
  { id: 5, store: 'Whole Foods', miles: 1.3 },
  { id: 6, store: 'Whole Foods', miles: 3 },
  { id: 7, store: 'Whole Foods', miles: 4 },
  { id: 8, store: 'Whole Foods', miles: 3.7 },
  { id: 9, store: 'Whole Foods', miles: 2.5 },
];

router.use((req, res, next) => {
  if (req.session.user) next();
  else res.send(401);
});

router.get('', (req, res) => {
  const { miles } = req.query;
  const parsedMiles = parseInt(miles);
  if (!isNaN(parsedMiles)) {
    const filteredStores = supermarkets.filter((s) => s.miles <= parsedMiles);
    res.send(filteredStores);
  } else res.send(supermarkets);
});

module.exports = router;
