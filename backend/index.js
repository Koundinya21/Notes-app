require("dotenv").config()

const config=require("./config.json");
const mongoose=require("mongoose");

mongoose.connect(config.connectionsString);

const User=require("./models/user.model")
const Note=require("./models/note.model");
// Connection status logging
const db = mongoose.connection;

db.on("connected", () => {
    console.log("✅ MongoDB connected successfully!");
});

db.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
});

db.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected.");
});

const express=require('express');
const cors=require('cors')


const app=express();

const jwt=require("jsonwebtoken")
const {authenticateToken}=require("./utilities");
const noteModel = require("./models/note.model");

app.use(express.json());

app.use(
    cors({
        origin:"*"
    })
);

app.get("/",(req,res)=>{
    res.json({data:"hellow"});
});



app.post("/create-account", async (req, res) => {
    try {
        console.log(req.body); // Log the body to check if it's parsed correctly
        
        const { fullName, email, password } = req.body;
        
        if (!fullName) {
            return res.status(400).json({ error: true, message: "Full Name is Required" });
        }
        if (!email) {
            return res.status(400).json({ error: true, message: "Email is Required" });
        }
        if (!password) {
            return res.status(400).json({ error: true, message: "Password is Required" });
        }

        const isUser = await User.findOne({ email: email });
        if (isUser) {
            return res.json({
                error: true,
                message: "User already Exists"
            });
        }

        const user = new User({
            fullName, email, password
        });

        await user.save();

        const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN, {
            expiresIn: "36000m",
        });

        return res.json({
            error: false,
            user,
            accessToken,
            message: "Registration Successful"
        });
    } catch (error) {
        console.error("Error during account creation:", error);  // Log the error
        return res.status(500).json({
            error: true,
            message: "An internal server error occurred",
            details: error.message
        });
    }
});

app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    if(!email){
        return res.status(400).json({message:"Email is Required"});
    }

    if(!password){
        return res.status(400).json({message:"Password is Required"});
    }

    const userInfo=await User.findOne({
        email:email
    })

    if(!userInfo){
        return res.status(400).json({message:"User not Found"});
    }

    if(userInfo.email ==email && userInfo.password==password){
        const user={user:userInfo};

        const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN,{
            expiresIn:"36000m"
        })

        return res.json({
            error:false,
            message:"Login Successful",
            email,
            accessToken
        })
    }else{
        return res.status(400).json({
            error:true,
            message:"Invalid Credentials"
        })
    }
})

app.get("/get-user",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    const isUser=await User.findOne({_id:user._id});

    if(!isUser){
        return res.sendStatus(401);
    }

    return res.json({
        user:{fullName:isUser.fullName,email:isUser.email,_id:isUser._id,createdOn:isUser.createdOn},
        message:"",
    })
})


app.post("/add-note",authenticateToken,async(req,res)=>{
     const {title,content,tags}=req.body;
     const {user}=req.user;
     if(!title){
        return res.status(400).json({error:true,message:"Title is required"});
     }

     if(!content){
        return res.status(400).json({error:true,message:"Content is required"})
     }

     try{
        const note=new noteModel({
            title,
            content,
            tags:tags || [],
            userId:user._id
        })
        await note.save();
        return res.json({
            error:false,
            note,
            message:"Note added Successfully"
        });
     }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        });
     }
});

app.put("/edit-note/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {title,content,tags,isPinned}=req.body;

    const {user}=req.user;

    if(!title && !content && !tags){
        return res.status(400).json({error:true,message:"No changes provided"})
    }


    try{
        const note=await Note.findOne({_id:noteId,userId:user._id});

        if(!note){
            return res.status(404).json({error:true,message:"Note not found"})
        }

        if(title) note.title=title;
        if(content) note.content=content;
        if(tags) note.tags=tags;
        if(isPinned) note.isPinned=isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note updated successfully"
        })
        
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
});

// Get All Notes
app.get("/get-all-notes/",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    try{
        const notes=await Note.find({userId:user._id}).sort({isPinned:-1});

        return res.json({
            error:false,
            notes,
            message:"All notes retrieved successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error",
        })
    }
})


// Delete Note

app.delete("/delete-note/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {user}=req.user;
    try{
        const note=await Note.findOne({_id:noteId,userId:user._id})
        if(!note){
            return res.status(404).json({error:true,message:"Note not found"})
        }

        await Note.deleteOne({_id:noteId,userId:user._id})

        return res.json({
            error:false,
            message:"Note deleted Successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }

})

// Update isPinned

app.put("/update-note-pinned/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {isPinned}=req.body;
    const {user}=req.user;

    // if(!isPinned){
    //     return res.status(400).json({
    //         error:true,
    //         message:"Note not found"
    //     })
    // }

    try{
        const note=await Note.findOne({_id:noteId,userId:user._id});

        if(!note){
            return res.status(404).json({error:true,message:"Note not found"})
        }

        note.isPinned=isPinned;

        await note.save();

        return res.json({
            error:false,
            note,
            message:"Note updated successfully"
        });
        
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
})

//Search Notes
app.get("/search-notes/",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    const {query}=req.query;

    if(!query){
        return res.status(400).json({error:true,message:"search query is required"})
    }

    try{
        const matchingNotes=await Note.find({
            userId:user._id,
            $or:[
                {title:{$regex:new RegExp(query,'i')}},
                {content:{$regex:new RegExp(query,"i")}}
            ],

        });

        return res.json({
            error:false,
            notes:matchingNotes,
            message:"Notes Matching the search query retrived successfully"
        })
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server Error"
        })
    }
})




app.listen(8000);

module.exports=app;