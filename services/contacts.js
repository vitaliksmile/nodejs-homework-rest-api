const Contact = require("./schemas/contactsSchema");
const listContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
};
const getContactById = async (contactId, owner) => {
  return await Contact.findOne({ _id: contactId, owner });
};
const removeContact = async (contactId, owner) => {
  return await Contact.findOneAndRemove({ _id: contactId, owner });
};
const addContact = async (body) => {
  return await Contact.create(body);
};
const updateContact = async (contactId, owner, body) => {
  return await Contact.findOneAndUpdate({ _id: contactId, owner }, body, {
    new: true,
  });
};
const updateStatusContact = async (contactId, owner, body) => {
  return await Contact.findOneAndUpdate({ _id: contactId, owner }, body, {
    new: true,
  });
};
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
