const express = require("express");
const router = express.Router();
const {
  Card,
  generateBuisnessNumber,
  validateCard,
} = require("../models/cards.model");
const authCheckMiddleWare = require("../middlewares/auth");
const { User } = require("../models/users");

router.get("/:id", authCheckMiddleWare, async (req, res) => {
  const card = await Card.findById({
    _id: req.params.id,
    user_id: req.user._id,
  });
  res.send(card);
});

router.delete("/:id", authCheckMiddleWare, async (req, res) => {
  const card = await Card.findOneAndRemove({
    _id: req.params.id,
    user_id: req.user._id,
  });
  if (!card) {
    res.status(404).send("their is not such a card with this specific id");
    return;
  }
  res.send(card);
});

router.post("/:id", authCheckMiddleWare, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
    console.log(error.details[0].message);
    res.status(400).send(error.details[0].message);
    return;
  }

  const card = await new Card({
    ...req.body,
    bizImage:
      req.body.bizImage ||
      "https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_960_720.png",
    bizNumber: await generateBuisnessNumber(),
    user_id: req.user._id,
  }).save();
  res.send(card);
});

router.put("/", authCheckMiddleWare, async (req, res) => {
  const { error } = validateCard(req.body);
  if (error) {
    console.log(error.details[0].message);
    res.status(400).send(error.details[0].message);
    return;
  }

  let card = await Card.findOneAndUpdate(
    {
      _id: req.params.id,
      user_id: req.user._id,
    },
    req.body
  );
  if (!card)
    return res.status(404).send("could not find a card with this specific id");
  card = await Card.findOne({ _id: req.params.id, user_id: req.user._id });
  res.send(card);
});
module.exports = router;
