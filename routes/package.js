const express = require('express');
const { Package, validateAT } = require('../models/packages');
const IsAdminUser=require("../middlewares/AuthMiddleware")
const router = express.Router();

router.use(IsAdminUser);

router.post('/', async (req, res) => {
  const { error } = validateAT(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { name, description, price, roi, image } = req.body;

  try {
    const newPackage = await Package.create({
      name,
      description,
      price,
      roi,
      image,
    });

    res.status(201).send(newPackage);
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).send('Internal server error');
  }
});


router.get('/', async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.send(packages);
  } catch (error) {
    console.error('Error getting packages:', error);
    res.status(500).send('Internal server error');
  }
});

router.get('/:id', async (req, res) => {
  const packageId = req.params.id;

  try {
    const package = await Package.findByPk(packageId);
    if (!package) {
      return res.status(404).send('Package not found');
    }

    res.send(package);
  } catch (error) {
    console.error('Error getting package:', error);
    res.status(500).send('Internal server error');
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validateAT(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const packageId = req.params.id;
  const { name, description, price, roi, image } = req.body;

  try {
    const package = await Package.findByPk(packageId);
    if (!package) {
      return res.status(404).send('Package not found');
    }

    await package.update({
      name,
      description,
      price,
      roi,
      image
    });

    res.send(package);
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).send('Internal server error');
  }
});

router.delete('/:id', async (req, res) => {
  const packageId = req.params.id;

  try {
    const package = await Package.findByPk(packageId);
    if (!package) {
      return res.status(404).send('Package not found');
    }

    await package.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
