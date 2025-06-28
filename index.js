const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load env vars
require('./config/db'); // This initializes the MongoDB connection

const Contact = require('./models/Contact'); // Import your Mongoose model

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, address } = req.body;
    const newContact = new Contact({ name, email, message, address });
    const saved = await newContact.save();

    res.status(201).json({ message: 'Contact saved successfully!', contact: saved });
  } catch (err) {
    console.error('Error saving contact:', err);
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

// Get all contacts with pagination support
app.get('/api/contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalContacts = await Contact.countDocuments();
    const contacts = await Contact.find().skip(skip).limit(limit);

    const totalPages = Math.ceil(totalContacts / limit);

    res.json({
      contacts,
      totalPages,
      currentPage: page,
      totalContacts
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Delete a contact by ID
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Update a contact by ID
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message, address } = req.body;
    const updated = await Contact.findByIdAndUpdate(
      id,
      { name, email, message, address },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
