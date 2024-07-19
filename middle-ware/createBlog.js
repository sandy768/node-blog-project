const jwt=require('jsonwebtoken');

class CreateBlog{
    async createBlog(req,res,next){
        try{
            if(req.cookies && req.cookies.token_details){
                jwt.verify(req.cookies.token_details,process.env.SECRET_KEY,(err,data)=>{
                    req.user=data;
                    next();
                })
            }
            else{
                next();
            }
        }
        catch(err){
            console.log("Error to verify token data",err);
        }
    }
}
module.exports=new CreateBlog();