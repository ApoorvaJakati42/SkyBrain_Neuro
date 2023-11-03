const express = require('express');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const { ObjectId } = require('mongodb');
const User =require('./mongoose/models/user')
const UserSession = require('./mongoose/models/userSession')
const ExcelFile = require('./mongoose/models/excelFile')
const MeasuredValues = require('./mongoose/models/measuredValues')
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const app = express();
const port = 5000;
const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

app.use(cors(corsOptions));
app.use(express.json());


let timeData = [];
let chillData = [];
let stressData = [];
let focusData = [];
let angerData = [];
let selfControlData = [];

let mongoData = [];


// Connect to MongoDB Atlas start
    mongoose.connect('mongodb+srv://apoorvajakati:Skybrain!12345@skybrain-mongoose.tknpzhk.mongodb.net/skybrain-mongoose', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    });

    const db = mongoose.connection;

  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });
  
  db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
  });


// Function to load data from an Excel file and search by name
function loadExcelDataByName(name) {
    console.log("Load excel function called ====>" + name);
     // Clear the arrays at the beginning
     timeData = [];
     chillData = [];
     stressData = [];
     focusData = [];
     angerData = [];
     selfControlData = [];
    
    const workbook = new ExcelJS.Workbook();
    return workbook.xlsx.readFile(name)
        .then(worksheet => {
            console.log("Data fetch Success");
            const data = [];
            
            const worksheet1 = workbook.getWorksheet(1); // Assuming data is in the first worksheet

            // Find the column index for the "name" column (replace with the actual column name)
            const nameColumnIndex = 16; // Replace with the correct column index (1-based)

            worksheet1.eachRow((row, rowNumber) => {
                if (rowNumber >= 3) { // Skip the first two rows if they are headers
                    const rowData = {};

                    const chillRowValues = row.getCell(16).value;
                    chillData.push(chillRowValues);
                   
                    const stressRowValues = row.getCell(17).value;
                    stressData.push(stressRowValues);

                    const focusRowValues = row.getCell(18).value;
                    focusData.push(focusRowValues);

                    const angerRowValues = row.getCell(19).value;
                    angerData.push(angerRowValues);

                    const selfControlRowValues = row.getCell(20).value;
                    selfControlData.push(selfControlRowValues);
                     
                    const timeRowValues = row.getCell(3).value;
                    timeData.push(timeRowValues)

                }
            });
            return data;
        })
        .catch(error => {
            console.error('Error loading Excel data:', error);
            return [];
        });
}

//loadExcelDataByName("Stress");

app.use(express.static('public'));



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
    cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// Function to extract data from excel by file name 
function extractEmotionsFromExcelSheet(fileName) {
  console.log("Path Name " + path.join(__dirname, 'uploads'));
  const urlPath = path.join(__dirname, 'uploads');
  console.log("Load excel function called " + `${urlPath}\\${fileName}`);
  const filePath = `${urlPath}\\${fileName}` ;
   // Clear the arrays at the beginning
   timeData = [];
   chillData = [];
   stressData = [];
   focusData = [];
   angerData = [];
   selfControlData = [];
   const data = [];
  
  const workbook = new ExcelJS.Workbook();
  return workbook.xlsx.readFile(filePath)
      .then(worksheet => {
          console.log("Data fetch Success");
       
          
          const worksheet1 = workbook.getWorksheet(1); 
          worksheet1.eachRow((row, rowNumber) => {
              if (rowNumber >= 3) { 
                  const rowData = {};

                  const chillRowValues = row.getCell(16).value;
                  chillData.push(chillRowValues);
                 
                  const stressRowValues = row.getCell(17).value;
                  stressData.push(stressRowValues);

                  const focusRowValues = row.getCell(18).value;
                  focusData.push(focusRowValues);

                  const angerRowValues = row.getCell(19).value;
                  angerData.push(angerRowValues);

                  const selfControlRowValues = row.getCell(20).value;
                  selfControlData.push(selfControlRowValues);
                   
                  const timeRowValues = row.getCell(3).value;
                  timeData.push(timeRowValues)

              }
          });

   const finalData = [timeData.slice(1,14) ,
                       chillData.slice(1,13) ,
                       stressData.slice(1,13),
                          focusData.slice(1,13),
                         angerData.slice(1,13),
                          selfControlData.slice(1,13)]
          return finalData;
          console.log("Final Data To Send " , finalData);
      })
      .catch(error => {
          console.error('Error loading Excel data:', error);
          return [];
      });
}

        // Serve static files from the 'uploads' directory
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Set up a route to serve an HTML form for user input and file upload
    app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    });

    // this route is to upload the file and name from the user into a folder
    //Modify code here to save name and excel file into mongo Db
    app.post('/api/saveRiderInfo', upload.single('excelFile'), async (req, res) => {
        console.log("saveRiderInfo started");

        // Access the FormData object
        const formData = req.body;
      
        // Extract data from formData
        const userName = formData.name;
        const sessionId = formData.sessionId;
        const sessionName = formData.sessionName;
      
        // You can also access the uploaded file as you did before
        const excelFile = req.file;
      
        if (excelFile) {
          const excelFileName = excelFile.originalname;
          const fileData = excelFile.buffer; // The file data as a binary buffer

            // Create a new ExcelFile document
            const excelFileDocument = new ExcelFile({
            fileName: excelFileName,
            fileData: fileData,
        });

        // Save the Excel file to the MongoDB collection
            try {
                const response = await excelFileDocument.save();
                 //Also write code or call function to save excel file in a folder
                console.log('Excel file saved to the collection and returned object is' ,
               
                 response._id);

                //Here Excel file is save to db 
                //Now fetch that file from db and modify and call the data extraction function..
                //.. and return that array of objects and then ...
                //..save it to userSession object's emotion object ..
                //.. and map userSession object with session id, session name ...
                //.. and finally save user and usersession object

                // Define the _id value you want to search for (replace with your actual _id value)
                const targetId = response._id;
                console.log("targetId " , targetId);
                // Use the `findById` method to search for the document with the specified _id
                const excelFileObj = ExcelFile.findById(targetId)
                .then(async (document) => {
                    if (document) {
                    console.log('Found document:', document.fileName);
                    //Here write code / call fn to extract data from the saved excel file 
                    // const workbook = new ExcelJS.Workbook();
                    // const buffer = excelFileObj.data;    
                    // const dataBlob = new Blob([buffer]);         
                    // await workbook.xlsx.load(dataBlob);
                    console.log("Excel file print " , excelFile.filename);
                    const extractedEmotionData = await extractEmotionsFromExcelSheet(excelFile.filename);
                      console.log("Final Data after fetching inside save function" , extractedEmotionData);
                    const dataToSaveToDb = extractedEmotionData.map((data , i) => {
                      return {
                          indexValue : i ,
                          value : data
                      }
                  })
                       
              //   res.json(dataToSaveToDb);
          
               

                  // console.log("User Object" , user);
                  // console.log("User Session Object" , userSession);
                  // userSession.emotions[0].value.forEach(element => {
                  //     console.log("Time values" , element);
                  // });
              
                  console.log("Save start");
                  try {
                    console.log("Save start 1");
                          // Your database operations here
                         
                          const user = new User({
                            name : userName
                         })
                        
        
                        //Add user key inside userSession object
                       
                          const userSavedId = await user.save();
                          console.log("UserSavedId" , userSavedId._id);
                          const userSession = new UserSession({
                            sessionId : sessionId ,
                            sessionName : sessionName ,
                            emotions : dataToSaveToDb  ,
                            user : userSavedId
                        });
                          await userSession.save();
                          console.log('User Session and User added successfully');
                        
                        console.log("Save start 2");
                      //res.status(201).send('User Session added successfully');
                    } catch (error) {
                      console.error('User Session error:', error);
                    // res.status(500).send('mongo Signup failed');
                    }
                    } else {
                    console.log('Document not found.');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching document:', error);
                });

            } catch (error) {
                console.error('Error saving Excel file:', error);
            }
      
          console.log("Excel File Name: ", excelFileName);
          console.log("Entered Name from user: ", userName, sessionId, sessionName);
      
          // Call function to convert Excel data and return the emotions array
        } else {
          console.log("No Excel file uploaded");
        }
      
        res.status(200).send(`User Name: ${userName}`);
     
    });

    app.post('/api/signup', async (req, res) => {
        const name = req.body.name;
        
        const user = new User({
            name : req.data.name
        });
    
        try {
            await user.save();
            res.status(201).send('Rider added successfully');
          } catch (error) {
            console.error('Rider Save error:', error);
            res.status(500).send('mongo Signup failed');
          }
       
      });
    
      app.post('/api/measuredValues', async (req, res) => {
                const xValues = req.body.xValues;
                const yValues  = req.body.yValues ;
                const stressValues = req.body.stressValues ;
                const focusValues =  req.body.focusValues ;
                const angerValues = req.body.angerValues 
                const selfValues = req.body.selfValues;
    
        const measuredValues = new MeasuredValues({ 
            xValues,
            yValues,
            stressValues,
            focusValues,
            angerValues,
            selfValues
        });
      
        try {
          await measuredValues.save();
          res.status(201).send('Data Saved Successfully');
          console.log('Data Saved Successfully');
        } catch (error) {
          console.error('Signup error:', error);
          res.status(500).send('Data save failed');
          
        }
      });


//This route is to fetch the data from excel file , then save to mongo and return those values
//back to UI
app.get('/sessionData', async (req, res) => {
    console.log(" sessionData Request listened")
    const searchName = req.query.fileName; // Name to search for
    console.log("FileName by user : " + searchName)

    //The below function converts the data
    const data = await loadExcelDataByName(searchName);

    const finalData = [timeData.slice(1,14) ,
                         chillData.slice(1,13) ,
                         stressData.slice(1,13),
                            focusData.slice(1,13),
                           angerData.slice(1,13),
                            selfControlData.slice(1,13)]
        const finalData1 = finalData.map((data , i) => {
            return {
                indexValue : i ,
                value : data
            }
        })
   // Send the filtered data as JSON
    finalData1.forEach((obj) => {
        console.log(obj);
      });

      mongoData = finalData1;
      res.json(mongoData);

      const sessionId = "SessionRide 1";
      const sessionName = "Test Session";
      const _id = 2;

      const userName = "Test Rider" ;
      const user = new User({
          name : userName
      })

      const userSession = new UserSession({
        _id : _id ,
        sessionId : sessionId ,
        sessionName : sessionName ,
        emotions : mongoData
    });

    try {
        db.once('open', async () => {
            // Your database operations here
            console.log("User to save" , user);
            console.log("User Session to save" , userSession);
            await user.save();
            await userSession.save();
            console.log('User Session added successfully');
          });
        
        //res.status(201).send('User Session added successfully');
      } catch (error) {
        console.error('User Session error:', error);
       // res.status(500).send('mongo Signup failed');
      }

});

//This route is to fetch the user name and the corresponding session data and send back to UI
//
app.get('/getSavedDataFromDb', async (req, res) => {
    console.log("getSavedDataFromDb request")
 
    const fetchDataFromCollections = async () => {
        try {
          const dataFromUserCollection = await User.findOne({
            name : "aaaaaa"
          }).lean();
          const dataFromUserSessionCollection = await UserSession.find( {
            user : new ObjectId("65432b8837eb18d52940126e")
          }).lean();

          console.log("User collection" , dataFromUserCollection)
          console.log("User Session collection" , dataFromUserSessionCollection)
      
          const result = {
            userData: dataFromUserCollection,
            userSessionData: dataFromUserSessionCollection,
          };
      
          console.log('Data fetched and sending', result);
          res.json(result);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        // } finally {
        //   mongoose.connection.close(); // Close the MongoDB connection when done
        // }
      };
      fetchDataFromCollections();
});

app.get('/getUsersFromDb', async (req, res) => {
  console.log("getUsersFromDb request")

  const fetchDataFromCollections = async () => {
      try {
        const dataFromUserCollection = await User.find({
        }).lean();
       

        console.log("User collection" , dataFromUserCollection)
    
    
        const result = {
          userData: dataFromUserCollection,
        };
    
        console.log('Data fetched and sending', result);
        res.json(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      // } finally {
      //   mongoose.connection.close(); // Close the MongoDB connection when done
      // }
    };
    fetchDataFromCollections();
});

app.get('/getUserSessionsFromDb', async (req, res) => {
  console.log("getUserSessionsFromDb request ")
  const userName = req.query.name ;
  const userId = req.query.id ;
  
  console.log("getUserSessionsFromDb UserName  " , userName)
  console.log("getUserSessionsFromDb UserId  " , userId)
  const fetchDataFromUserSessions = async () => {
      try {
        const dataFromUserSessionCollection = await UserSession.find( {
          user : new ObjectId(userId)
        }).lean();

        if (dataFromUserSessionCollection) {
          console.log("User Session collection" , dataFromUserSessionCollection)
        }
        else {
          console.log("No sessions for user")
        }

        
    
        const result = {
          userSessionData: dataFromUserSessionCollection,
        };
    
        //console.log('Data fetched and sending', result);
        res.json(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      // } finally {
      //   mongoose.connection.close(); // Close the MongoDB connection when done
      // }
    };
    fetchDataFromUserSessions();
});






// app.get('/emotionName', async (req, res) => {
//     console.log("Request listened")
//     const searchName = req.query.name; // Name to search for
//     console.log("FileName by user : " + searchName)
//     const data = await loadExcelDataByName(searchName);

//     const finalData = [timeData.slice(1,14) ,
//                          chillData.slice(1,13) ,
//                          stressData.slice(1,13),
//                             focusData.slice(1,13),
//                            angerData.slice(1,13),
//                             selfControlData.slice(1,13)]
//         const finalData1 = finalData.map((data , i) => {
//             return {
//                 indexValue : i ,
//                 value : data
//             }
//         })

//     // Send the filtered data as JSON
//     // finalData1.forEach((obj) => {
//     //     console.log(obj);
//     //   });
   
//     res.json(finalData1);
// });

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
