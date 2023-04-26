const express = require('express');
const { Package } = require('../models/packages');
const { User } = require('../models/user');
const {Purchase} = require('../models/purchase');
const {Wallet} = require('../models/wallet');
const IsUser=require("../middlewares/AuthMiddleware")
const router = express.Router();
const moment = require('moment'); 
const { Op } = require('sequelize');
router.use(IsUser);

router.post('/', async (req, res) => {
  try {
    const { package_id, user_id } = req.body;

    const package = await Package.findByPk(package_id);
    if (!package) {
      return res.status(404).send('Package not found');
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const wallet = await Wallet.findOne({ where: { user_id } });
    if (!wallet) {
      return res.status(404).send('Wallet not found');
    }

    if (wallet.balance < package.price) {
      return res.status(400).send('Insufficient balance in wallet');
    }

    await Purchase.create({ package_id, user_id });

    await Wallet.update({ balance: wallet.balance - package.price }, {
      where: { user_id }
    });

    return res.send('Package purchased successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


router.get('/', async (req, res) => {
    try {
      const purchases = await Purchase.findAll({
        include: [
          {
            model: User,
            as: 'user',
          },
          {
            model: Package,
            as: 'package',
          },
        ],
      });

      const results = purchases.map((purchase) => {
        const remainingDays = moment(purchase.created_at).add(1, 'month').diff(moment(), 'days'); // Calculate remaining days
        return {
          ...purchase.toJSON(),
          remaining_days: remainingDays,
        };
      });
  
      return res.send(results);
    } catch (error) {
      console.error(error);
      return res.status(500).send('An error occurred');
    }
  });


  router.get('/:user_id', async (req, res) => {
    try {
      const cutoffDate = moment().subtract(1, 'month').toDate(); 
  
      const purchases = await Purchase.findAll({
        where: {
          user_id: req.params.user_id,
          created_at: { [Op.gt]: cutoffDate }, 
        },
        include: [
          {
            model: User,
            as: 'user',
          },
          {
            model: Package,
            as: 'package',
          },
        ],
      });
  
      const results = purchases.map((purchase) => {
        const remainingDays = moment(purchase.created_at).add(1, 'month').diff(moment(), 'days'); // Calculate remaining days
        return {
          ...purchase.toJSON(),
          remaining_days: remainingDays,
        };
      });
  
      return res.send(results);
    } catch (error) {
      console.error(error);
      return res.status(500).send('An error occurred');
    }
  });
  

module.exports = router;
