const express = require("express");
const Joi = require("joi");
const {
  getContactById,
  removeContact,
  listContacts,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../../services/contacts");

const router = express.Router();
const createSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
}).required();

const updateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
}).or("name", "email", "phone");

const validator = (schema, message) => (req, res, next) => {
  const body = req.body;
  console.log("body", body);
  const validation = schema.validate(body);

  if (validation.error) {
    res.status(400).json({ message });
    return;
  }

  return next();
};
router.get("/", async (req, res, next) => {
  const ollContacts = await listContacts();
  res.set("Content-Type", "application/json").send(ollContacts);
  // res.json({ ollContacts });
});

router.get("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const contact = await getContactById(contactId);
  if (!contact) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.json({ contact });
});

router.post(
  "/",
  validator(createSchema, "missing required name field"),
  async (req, res, next) => {
    const contact = req.body;

    res.status(201).json(await addContact(contact));
  }
);

router.delete("/:contactId", async (req, res, next) => {
  const contactId = req.params.contactId;
  const isRemoveContact = await removeContact(contactId);
  if (!isRemoveContact) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  res.status(201).json({ message: "contact deleted" });
});

router.put(
  "/:contactId",
  validator(updateSchema, "missing fields"),
  async (req, res, next) => {
    const contactId = req.params.contactId;
    const contact = await updateContact(contactId, req.body);
    if (contact !== null) {
      res.json(contact);
      return;
    }
    res.status(404).json({ message: "Not found" });
  }
);

router.patch("/:contactId/favorite", async (req, res, next) => {
  const { contactId } = req.params;
  const { error } = contactSchema.validate(req.body);
  const contact = await updateStatusContact(contactId, req.body);
  if (!contact) {
    res.status(404).json({
      status: "error",
      code: 404,
      message: "Not found",
    });
  }
  if (error) {
    res.status(400).json({
      status: "error",
      code: 400,
      message: "missing field favorite",
    });
  }
  res.status(200).json({
    status: "success",
    code: 200,
    data: {
      contact,
    },
  });
});

module.exports = router;
