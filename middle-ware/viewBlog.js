const jwt=require('jsonwebtoken');

class ViewBlog{
    async viewBlog(req,res,next){
        try{
            if(req.cookies && req.cookies.token_blog){
                jwt.verify(req.cookies.token_blog,process.env.SECRET_KEY,(err,data)=>{
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
module.exports=new ViewBlog();