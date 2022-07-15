const express =  require('express');
const mongoose = require('mongoose'); //To configure mongo DB
const RegisterUser = require('./model');//mongoose schema
const jwt = require('jsonwebtoken'); // it is required to generate token for login system
const middleware = require('./middleware') // it importes the decoded data 
const cors = require('cors') //to access data form fornt end
const app =  express();

mongoose.connect('mongodb+srv://kshankar:Pw0GSp05GBGwPN9B@cluster0.vziuf.mongodb.net/?retryWrites=true&w=majority').then(
    console.log("Monogo DB is connected")
);

app.use(cors({origin: "*"})) // to use accessed data from fornt end
// Normal Router
app.get('/', (req, res)=>{
    res.send("Hello Shankar ji")
})

app.use(express.json()) //body parser
// for registration
app.post('/register', async(req, res)=>{
    try{
        const {username, email, phonenumber, password, confirmpassword} = req.body; //destructure the data from body
        const exist = await RegisterUser.findOne({email}); //To check user mail is already exist or not
        if(exist){
            return res.status(400).send('user already exist');
        }
        if(password !== confirmpassword){ //if not exists then check the password & confirm password matched or not
            return res.status(400).send('password and confirm passwords are not matched')
        }
        const newuser = RegisterUser({ //if not exist and password correct then data should pass to Database
            username,
            email,
            phonenumber,
            password,
            confirmpassword
        })
        await newuser.save(); //to save the data in database
        res.status(200).send('Registered successfully'); //confirmation message

    }
    catch(err){  // if any error while transferring the data in db or server
        console.log(err)
        res.status(500).send('Server error')
    }
})

//for Login system
app.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body; //destructure the data which is get from login page
        const exist = await RegisterUser.findOne({email}); //check if email is exist or not
        if(!exist){ // not exist then throw a message
            return res.status(400).send('You are not registered');
        }
        if(password !== exist.password){ // if exists then check the password in db and entered password are same or not
            return res.status(400).send('invalid credentials') //not same then throw message
        }
        let payload={
            user:{
                id: exist.id //particular user id //this id is encoded into token
            }
        }
        //jwtsecure is a key. which is very important to decode the token to id//
        jwt.sign(payload, 'jwtsecure', { expiresIn: 3600000 }, // if login credentials are matched with DB then create json web token(encode)
        (err, token)=>{
            if(err) throw err; //any err then throw it
            return res.json({token}) // there is no error then return the token
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).send('internal server error')
    }
}) //token generated, you can test in postman
//dashboard
app.get('/dashboard', middleware, async(req, res)=>{
    try{
        let exist = await RegisterUser.findById(req.user.id) //check middleware imports correct user id
        if(!exist){ // user id is fourd or not. if not found thorw an error
            return res.status(400).send('user not found')
        }
        res.json(exist) //if found then convert to json
    }
    catch(err){
        console.log(err)
    }
})
app.listen(4000, ()=>{
    console.log("Server is started running....")
})
