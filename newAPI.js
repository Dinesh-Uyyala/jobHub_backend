const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json())

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "zeba_database"

});

app.get('/jobs', (req, res) => {
    db.query("SELECT * FROM zeba_jobslist", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
}); 


db.connect((err)=>{
if(err){
    console.log(err)
}else{console.log("connected !!")
}
})



app.post('/employer-register', (req, res) => {

    const { FullName, Email, CompanyName, Password, ConfirmPassword} = req.body;
    console.log(req.body);

    const query = 'INSERT INTO employer_register (FullName, Email, CompanyName, Password, ConfirmPassword) VALUES (?, ?, ?, ?, ?)';

  
    db.query(query, [FullName, Email, CompanyName, Password, ConfirmPassword], (err, result) => {
      if (err) {

          console.log(err);
        

        return res.status(500).json({ error: 'Error in resgistration' });
      }
      res.status(201).json({ message: 'registration successfull', userId: result.insertId });
    });
  });

  
  app.post('/post-job', (req, res) => {

    const { JobTitle, Location, Qualification, Skills, JobDescription} = req.body;
    console.log(req.body);

    const query = 'INSERT INTO zeba_post_job (JobTitle, Location, Qualification, Skills, JobDescription) VALUES (?, ?, ?, ?, ?)';

  
    db.query(query, [JobTitle, Location, Qualification, Skills, JobDescription], (err, result) => {
      if (err) {

          console.log(err);
        

        return res.status(500).json({ error: 'Error in posting Job' });
      }
      res.status(201).json({ message: 'Job Posted', userId: result.insertId });
    });
  });


 
app.listen(8000, () => console.log("Server running on port 8000"));

