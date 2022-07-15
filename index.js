const express =  require('express');
const mongoose = require('mongoose');
const RegisterUser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware')
const cors = require('cors')
const app =  express();

mongoose.connect('mongodb+srv://kshankar:Pw0GSp05GBGwPN9B@cluster0.vziuf.mongodb.net/?retryWrites=true&w=majority').then(
    console.log("Monogo DB is connected")
);

app.use(cors({origin: "*"}))
app.get('/', (req, res)=>{
    res.send("Hello Shankar ji")
})

app.use(express.json()) //body parser
// for registration
app.post('/register', async(req, res)=>{
    try{
        const {username, email, phonenumber, password, confirmpassword} = req.body;
        const exist = await RegisterUser.findOne({email});
        if(exist){
            return res.status(400).send('user already exist');
        }
        if(password !== confirmpassword){
            return res.status(400).send('password and confirm passwords are not matched')
        }
        const newuser = RegisterUser({
            username,
            email,
            phonenumber,
            password,
            confirmpassword
        })
        await newuser.save();
        res.status(200).send('Registered successfully');

    }
    catch(err){
        console.log(err)
        res.status(500).send('Server error')
    }
})

//for Login system
app.post('/login', async(req, res)=>{
    try{
        const {email, password} = req.body;
        const exist = await RegisterUser.findOne({email});
        if(!exist){
            return res.status(400).send('You are not registered');
        }
        if(password !== exist.password){
            return res.status(400).send('invalid credentials')
        }
        let payload={
            user:{
                id: exist.id
            }
        }
        jwt.sign(payload, 'jwtsecure', { expiresIn: 3600000 },
        (err, token)=>{
            if(err) throw err;
            return res.json({token})
        })

    }
    catch(err){
        console.log(err);
        return res.status(500).send('internal server error')
    }
})
//dashboard
app.get('/dashboard', middleware, async(req, res)=>{
    try{
        let exist = await RegisterUser.findById(req.user.id)
        if(!exist){
            return res.status(400).send('user not found')
        }
        res.json(exist)
    }
    catch(err){
        console.log(err)
    }
})
app.listen(4000, ()=>{
    console.log("Server is started running....")
})