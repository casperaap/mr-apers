require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use the environment variable
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle newsletter signup
app.post('/subscribe', async (req, res) => {
    const { firstName, email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const data = {
        email: email,
        attributes: {
            FNAME: firstName,
        },
        listIds: [2], // Replace with your Brevo list ID
        updateEnabled: true,
    };

    try {
        const response = await axios.post('https://api.brevo.com/v3/contacts', data, {
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY, // Use the API key from .env
                'content-type': 'application/json',
            },
        });

        res.status(200).json({ message: 'Contact added successfully!', data: response.data });
    } catch (error) {
        res.status(500).json({ message: 'Error adding contact.', error: error.response?.data || error.message });
    }
});

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { amount, name, email } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // Customize payment methods as needed
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Donation' },
                        unit_amount: amount, // Amount in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:30/index.html',
            cancel_url: 'http://localhost:30/index.html',
            customer_email: email,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/submit-feedback', (req, res) => {
    const { email, message } = req.body;

    // Validate required fields
    if (!email || !message) {
        return res.status(400).json({ status: 'error', message: 'Email and message are required.' });
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ status: 'error', message: 'Invalid email format.' });
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: email,
        to: 'epiclegend1298@gmail.com',
        subject: `Feedback from ${email}`,
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error while sending email:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send feedback.' });
        }

        res.status(200).json({ status: 'success', message: 'Feedback sent successfully!' });
    });
});


// Set up the form route
// Route to handle form submissions
app.post('/send-email', (req, res) => {
    const { firstName, lastName, emailAddress, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !emailAddress || !message) {
        return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this to other email providers like 'Yahoo', 'Outlook', etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: emailAddress, // Sender's email address
        to: 'epiclegend1298@gmail.com', // Recipient's email address
        subject: `New message from ${firstName} ${lastName}`,
        text: `You have received a new message from your website contact form:\n\n
First Name: ${firstName}\n
Last Name: ${lastName}\n
Email: ${emailAddress}\n
Message:\n${message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error while sending email:', error);
            return res.status(500).json({ status: 'error', message: 'Failed to send email.' });
        }

        console.log('Email sent:', info.response);
        res.status(200).json({ status: 'success', message: 'Email sent successfully!' });
    });
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
