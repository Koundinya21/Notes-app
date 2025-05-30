// const jwt = require("jsonwebtoken");
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];

//     if (!token) {
//         return res.status(401).json({ error: true, message: "Token missing" });
//     }

//     jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
//         if (err) {
//             console.log("JWT Error:", err.message);
//             return res.status(403).json({ error: true, message: "Invalid or expired token" });
//         }
//         req.user = user;
//         next();
//     });
// }

const jwt=require('jsonwebtoken');
function authenticateToken(req,res,next){
    const authHeader=req.headers["authorization"];
    const token=authHeader && authHeader.split(" ")[1];

    if(!token) return res.sendStatus(401);

    jwt.verify(token,process.env.ACCESS_TOKEN,(err,user)=>{
        if(err) return res.sendStatus(401);
        req.user=user;
        next();

    });
}

module.exports={
    authenticateToken
}