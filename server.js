const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'sufyaan',
  password: 'vodacom12345?',
  database: 'sufyaan'
});

// Connect to MySQL
connection.connect(error => {
  if (error) {
    console.error('Error connecting to the database: ' + error.stack);
    return;
  }
  console.log('Connected to database.');
});

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve your HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/appointment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'submit_appointment.html'));
});

// Handle appointment form submission
app.post('/submit-appointment', (req, res) => {
  console.log('Received appointment submission:', req.body);

  const { name, email, phone, appointment_type, date, time, comments } = req.body;
  
  // Validate required fields
  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // First, check if the patient already exists
  connection.query('SELECT * FROM patients WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error checking patient:', error);
      return res.status(500).json({ error: 'Error checking patient', details: error.message });
    }

    let patientId;

    if (results.length === 0) {
      // Patient doesn't exist, add them to the patients table
      connection.query('INSERT INTO patients SET ?', { name, email, phone }, (error, result) => {
        if (error) {
          console.error('Error adding new patient:', error);
          return res.status(500).json({ error: 'Error adding new patient', details: error.message });
        }
        console.log('New patient added:', result);
        patientId = result.insertId;
        bookAppointment(patientId);
      });
    } else {
      patientId = results[0].id;
      bookAppointment(patientId);
    }
  });

  function bookAppointment(patientId) {
    let query = 'INSERT INTO appointments SET ?';
    let values = {
      patient_id: patientId,
      appointment_type,
      date,
      time,
      comments
    };

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('Error saving appointment:', error);
        return res.status(500).json({ error: 'Error booking appointment', details: error.message });
      }
      console.log('Appointment booked successfully:', results);
      // Redirect to the appointment page with a success parameter
      res.redirect('/appointment?success=true');
    });
  }
});

// Get future appointments
app.get('/staff/future-appointments', (req, res) => {
  const query = `
    SELECT a.*, p.name, p.email, p.phone 
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.date >= CURDATE() 
    ORDER BY a.date ASC, a.time ASC
  `;
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching future appointments:', error);
      return res.status(500).json({ error: 'Error fetching future appointments', details: error.message });
    }
    res.json(results);
  });
});

// Get all patients
app.get('/patients', (req, res) => {
  connection.query('SELECT * FROM patients', (error, results) => {
    if (error) {
      console.error('Error fetching patients:', error);
      return res.status(500).json({ error: 'Error fetching patients', details: error.message });
    }
    res.json(results);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
