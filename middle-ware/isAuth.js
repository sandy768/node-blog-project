const jwt=require('jsonwebtoken');

class AuthJwt{
    async authJwt(req,res,next){
        try{
            if(req.cookies && req.cookies.token_data){
                jwt.verify(req.cookies.token_data,process.env.SECRET_KEY,(err,data)=>{
                    // console.log("Token Data",data);
                    req.user=data;
                    next();
                })
            }
            else{
                next();
            }
        }
        catch(err){
            console.log("Error to verify token",err);
        }
    }
}
module.exports=new AuthJwt();