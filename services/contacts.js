const Contact = require("./schemas/contactsSchema");
const listContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
};
const getContactById = async (contactId) => {
  return await Contact.findOne({ _id: contactId });
};
const removeContact = async (contactId) => {
  return await Contact.findOneAndRemove({ _id: contactId });
};
const addContact = async (body) => {
  return await Contact.create(body);
};
const updateContact = async (contactId, body) => {
  return await Contact.findOneAndUpdate({ _id: contactId }, body, {
    new: true,
  });
};
const updateStatusContact = async (contactId, body) => {
  return await Contact.findOneAndUpdate({ _id: contactId }, body, {
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
