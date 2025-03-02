const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "paul",
    database: "HospitalDB"
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log("MySQL connected successfully");
});

app.get('/', (req, res) => {
    return res.json("DONE");
});

app.get('/patient', (req, res) => {
    const sql = "SELECT * FROM patient";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    const sql = "SELECT * FROM patient WHERE id = ?";
    
    db.query(sql, [patientId], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json({ message: "Patient not found" });
        return res.json(data[0]);
    });
});

app.post('/patient', (req, res) => {
    const { firstName, lastName, dateOfBirth, gender, phoneNumber, email, address } = req.body;
    
    if (!firstName || !lastName || !dateOfBirth || !gender || !phoneNumber || !email || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    const sql = "INSERT INTO patient (firstName, lastName, dateOfBirth, gender, phoneNumber, email, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [firstName, lastName, dateOfBirth, gender, phoneNumber, email, address], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "Email already exists" });
            }
            return res.status(500).json(err);
        }
        
        return res.status(201).json({
            id: result.insertId,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            address
        });
    });
});

// UPDATE patient
app.put('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    const { firstName, lastName, dateOfBirth, gender, phoneNumber, email, address } = req.body;
    
    if (!firstName || !lastName || !dateOfBirth || !gender || !phoneNumber || !email || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    const sql = "UPDATE patient SET firstName = ?, lastName = ?, dateOfBirth = ?, gender = ?, phoneNumber = ?, email = ?, address = ? WHERE id = ?";
    
    db.query(sql, [firstName, lastName, dateOfBirth, gender, phoneNumber, email, address, patientId], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "Email already exists" });
            }
            return res.status(500).json(err);
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        return res.json({
            id: patientId,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phoneNumber,
            email,
            address,
            message: "Patient updated successfully"
        });
    });
});


app.delete('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    const sql = "DELETE FROM patient WHERE id = ?";
    
    db.query(sql, [patientId], (err, result) => {
        if (err) return res.status(500).json(err);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Patient not found" });
        }
        
        return res.json({ message: "Patient deleted successfully" });
    });
});

app.listen(8081, () => {
    console.log("Server running on port 8081");
});