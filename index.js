import express from "express"
import chalk from "chalk"
import cors from "cors"
import { MongoClient, ObjectId} from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid} from "uuid";
import dayjs from "dayjs";
const app= express();
app.use(cors());
app.use(express.json());
dotenv.config();
const mongoClient= new MongoClient(process.env.MONGO_URI);    
let wallet;
const promise= mongoClient.connect();
promise.then(()=>{
    wallet=mongoClient.db("myWallet");
    console.log(chalk.bold.blue(" data base em pé"))
})
const  signSchema= joi.object({
    name: joi.string().min(1).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(1).required(),
    repassword: joi.ref('password')
})
app.post("/sign-up",async (req,res)=>{
  const {name,email,password,repassword}=req.body;
  const xx={name,email,password,repassword}
  const validate= signSchema.validate(xx,{abortEarly:false})
  const cryptPassword= bcrypt.hashSync(password,10)
  if(validate.error){
      res.status(409).send(validate.error.details.map((e)=>{return e.message}))
      return;
  }
  const user={name,email,password:cryptPassword};
  console.log({user})
  try{
      const searchEmail= await wallet.collection("users").findOne({email})  
      console.log({searchEmail})
      if(searchEmail){
          res.status(400).send("e-mail has used")
          return;
        }
        await wallet.collection("users").insertOne(user);
        res.sendStatus(200)
    }catch(e){
        res.status(409).send(e)
    }
})

app.post("/sign-in",async (req,res)=>{
    const {email,password}= req.body;
    try{
        const searchEmail= await wallet.collection("users").findOne({email})
        if(!searchEmail){ return res.status(409).send("user not find")}
        const returnPassword= bcrypt.compareSync(password,searchEmail.password);
        if(!returnPassword){
            res.status(401).send("password or e-mail invalid...");
            return;
        }
        const token= uuid();
        await wallet.collection("sessions").insertOne({
            token,            
            userId:searchEmail._id
        })

        res.status(200).send({token,user:searchEmail.name});
    }catch(e){
        res.status(409).send(e)
    }
})
app.post("/messages",async (req,res)=>{
    const {authorization}=req.headers;
    const {value,type,describe}=req.body;
    const validateschema=joi.object({
     value:joi.number().min(1).required(),
     type: joi.any().valid("entrada", "saida").required(),
     describe: joi.string().min(1).required() 
    })
    const objectValidate=validateschema.validate(req.body);
    if(objectValidate.error){
         res.status(400).send(objectValidate.error.details.map(e=>{return e.message}));
         return;
        }
    const valid= authorization?.replace("bearer","").trim();
    if(!valid)return res.sendStatus(401);
    // const xx= "99995a21-a919-4f2f-841b-770d8cdb980d";
    try{
    const search= await wallet.collection("sessions").findOne({token:valid});
    const searchUser= await wallet.collection("users").findOne({_id:search.userId})
    if(!searchUser) return res.sendStatus(404)
    const account= {value,type,describe,
        time:dayjs().format("DD/MM"),
        user:searchUser._id,
    }
     await wallet.collection("messages").insertOne(account)
     delete account.user;
    res.status(200).send(account)
    }catch(e){
        res.sendStatus(409);
    }
})
app.get("/messages",async (req,res)=>{
    let limit = req.query.limit;
    const {authorization}=req.headers;
    const valid= authorization?.replace("bearer","").trim();
    if(!valid)return res.sendStatus(401);
    try{
    const search= await wallet.collection("sessions").findOne({token:valid});
    const searchUser= await wallet.collection("users").findOne({_id:search.userId})
    const messagesUser=await wallet.collection("messages").find({user:searchUser._id}).toArray();
    messagesUser.forEach(message=>{
    delete message.user;
    })
    if (!limit) {
        limit = messagesUser.length;
      }
    res.status(200).send(messagesUser.splice(0, parseInt(limit)));
    }catch(e){
        res.sendStatus(409);
    }
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(chalk.bold.green("Silencio, estamos no AR!!!"));  });
  