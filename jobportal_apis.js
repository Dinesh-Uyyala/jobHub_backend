const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
// const multer = require('multer');
// const path = require('path');

const app = express();
app.use(cors());
app.use(express.json())

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Define the folder where uploaded files will be saved
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique filename for the uploaded file
//     cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1633029001234.jpg
//   }
// });

// const upload = multer({ storage });


const db = mysql.createConnection({
    host: "mysql.avishkarindustries.com",
    user: "flh_user2",
    password: "z3M5-gQDX_Ba!8[23",
    database: "flh_student"

});

// app.get('/jobs', (req, res) => {
//     db.query("SELECT * FROM zeba_jobslist", (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.json(results);
//     });
// }); 


db.connect((err)=>{
if(err){
    console.log(err)
}else{console.log("connected !!")
}
})


app.post('/employer-register', (req, res) => {

    const {  FullName, Email, CompanyName, Password, ConfirmPassword} = req.body;
    const Role = 'Employer';
    console.log(req.body);

    const query = 'INSERT INTO zeba_users  ( Role, FullName, Email, CompanyName, Password, ConfirmPassword) VALUES ( ?, ?, ?, ?, ?, ?)';

  
    db.query(query, [ Role, FullName, Email, CompanyName, Password, ConfirmPassword], (err, result) => {
      if (err) {

          console.log(err);
        

        return res.status(500).json({ error: 'Error in  creating user' });
      }
      res.status(201).json({ message: 'User created', userId: result.insertId });
    });
  });


  app.post('/applicant-register', (req, res) => {
    const { FullName, Email, Phone, Password, Resume } = req.body;
  
    
    const Role = 'Applicant';
  
    const query = 'INSERT INTO zeba_users (Role, FullName, Email, Phone, Password, Resume) VALUES (?, ?, ?, ?, ?, ?)';
  
    db.query(query, [Role, FullName, Email, Phone, Password, Resume], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error in creating user' });
      }
      res.status(201).json({ message: 'User created', userId: result.insertId });
    });
  });


 
app.post('/post-job', (req, res) => {
  const { employer_email, company, Skills, Location, Qualifications, JobTitle, jobDescription, Salary, Experiance } = req.body;

  const query = 'INSERT INTO zeba_jobs (employer_email, company, JobTitle, Location, Qualification, Skills, JobDescription, Salary, Experiance) VALUES (?,?,?,?,?,?,?,?,?)';

  db.query(query, [employer_email, company, JobTitle, Location, Qualifications, Skills, jobDescription, Salary, Experiance], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error in posting job' });
    }
    res.status(201).json({ message: 'Job Posted Successfully!', jobId: result.insertId });
  });
});

  app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM zeba_users WHERE Email = ? AND Password = ?";

    db.query(query, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length > 0) {
            const user = results[0]; // ✅ Get full user data
            res.json({ 
                message: "Login successful", 
                role: user.Role,  // ✅ Send role separately
                user: user  // ✅ Send full user data
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    });
});



app.post('/create-profile', (req, res) => {
  const { name, email, phone, Resume,skills,education } = req.body;


  const query = 'INSERT INTO zeba_users ( FullName, Email, Phone, Resume, Skills, Education) VALUES (?, ?, ?, ?, ?, ?)';

  db.query(query, [ name, email, phone, Resume, skills,education], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error in creating applicant profile' });
    }
    res.status(201).json({ message: 'applicant profile created', userId: result.insertId });
  });
});

app.post('/apply-job', (req, res) => {
  const { job_id, applicant_name, applicant_email } = req.body;

  const sql = 'INSERT INTO zeba_jobApplications (job_id, applicant_name, applicant_email) VALUES (?, ?, ?)';
  db.query(sql, [job_id, applicant_name, applicant_email], (err, result) => {
    if (err) {
      console.error('Apply Job Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json({ message: 'Application submitted' });
  });
});

// GET Profile API
app.get('/get-profile-by-email', (req, res) => {
  const email = req.query.email; // Get email from request

  db.query(
    'SELECT id, Role, FullName, Email, Resume,Phone, Skills, Education FROM zeba_users WHERE Email = ?',
    [email],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Database Query Error', details: err });
      } else if (result.length > 0) {
        res.status(200).json(result[0]); // Return full profile with all fields
      } else {
        res.status(404).json({ message: 'Profile Not Found' });
      }
    }
  );
});

 

app.put("/update-profile/:email", (req, res) => {
  const email = req.params.email;
  const { FullName, Phone, Resume, Skills, Education } = req.body;

  const sql = `UPDATE zeba_users 
               SET FullName=?, Phone=?, Resume=?, Skills=?, Education=? 
               WHERE Email=?`;

  db.query(sql, [FullName, Phone, Resume, Skills, Education, email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Profile updated successfully" });
  });
});

app.get("/get-profile/:email", (req, res) => {
  const email = req.params.email;
  const sql = "SELECT * FROM zeba_users WHERE Email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result[0]); // Return user details
  });
});

app.get("/search", (req, res) => {
  const { keyword } = req.query;
  const searchQuery = `
      SELECT * FROM zeba_jobs 

      WHERE JobTitle LIKE ? OR JobDescription LIKE ? OR Location LIKE ?
  `;

  db.query(searchQuery, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`], (err, results) => {
      if (err) {
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });
});


// 1️⃣ API to Get All Jobs
app.get('/jobs', (req, res) => {
  const query = `
    SELECT 
      id, 
      company, 
      Location, 
      Skills, 
      Qualification,
      Experiance
    FROM zeba_jobs
  `;

  db.query(query, (err, results) => {
    if (err) {
      // Send error message if the query fails
      res.status(500).json({
        success: false,
        message: 'Error fetching jobs from the database.',
        error: err.message,
      });
    } else if (results.length === 0) {
      // If no jobs found, send a "no data" message
      res.status(404).json({
        success: false,
        message: 'No job listings found.',
      });
    } else {
      // Success message and data
      res.status(200).json({
        success: true,
        message: 'Jobs fetched successfully.',
        data: results,
      });
    }
  });
});




app.get('/get-posted-jobs', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const query = `
    SELECT id, JobTitle, company, Location, Qualification, Skills, JobDescription, Salary, Experiance 
    FROM zeba_jobs 
    WHERE employer_email = ?
    ORDER BY id DESC
  `;

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No jobs found for this employer' });
    }

    res.status(200).json(result);
  });
});


app.get('/get-job/:id', (req, res) => {
  const jobId = req.params.id;

  db.query(
    'SELECT * FROM zeba_jobs WHERE id = ?',
    [jobId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database Query Error', details: err });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.status(200).json(result[0]); // ✅ Return the job details
    }
  );
});

app.put('/update-job/:id', (req, res) => {
  const jobId = req.params.id; // ✅ Get job ID from URL
  const { JobTitle, Location, Qualification, Skills, JobDescription, employer_email } = req.body;

  if (!jobId || !JobTitle || !Location || !Qualification || !Skills || !JobDescription || !employer_email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    UPDATE zeba_jobs 
    SET JobTitle = ?, Location = ?, Qualification = ?, Skills = ?, JobDescription = ? 
    WHERE id = ? AND employer_email = ?
  `;

  db.query(query, [JobTitle, Location, Qualification, Skills, JobDescription, jobId, employer_email], (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Database update failed", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No job found with this ID and employer email" });
    }

    res.status(200).json({ message: "Job updated successfully!" });
  });
});


app.delete('/delete-job/:id', (req, res) => {
  const jobId = req.params.id;

  const query = 'DELETE FROM zeba_jobs WHERE id = ?';
  db.query(query, [jobId], (err, result) => {
    if (err) {
      console.error('Error deleting job:', err);
      return res.status(500).json({ error: 'Failed to delete job' });
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  });
});


app.listen(5000, () => console.log("Server running on port 5000"));




