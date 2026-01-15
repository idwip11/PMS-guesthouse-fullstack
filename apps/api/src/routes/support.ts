import { Router } from 'express';
import { sendEmail } from '../services/mailer';

const router = Router();

// POST /api/support/ticket
router.post('/ticket', async (req, res) => {
  try {
    const { subject, category, priority, message, userEmail } = req.body;

    if (!message || !subject) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Email to Developer
    const developerEmail = 'imamdpurwanto11@gmail.com';
    const emailSubject = `[Support Ticket] ${category}: ${subject}`;
    const emailHtml = `
      <h2>New Support Ticket</h2>
      <p><strong>From:</strong> ${userEmail || 'Anonymous'}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <hr />
      <h3>${subject}</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const success = await sendEmail(developerEmail, emailSubject, emailHtml);

    if (success) {
      res.json({ message: 'Ticket submitted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Error submitting ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
