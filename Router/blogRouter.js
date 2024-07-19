const express=require('express');
const router=express.Router();
const {getReg,postReg,mailVerification,getLog,postLog,userAuth,getDash,createBlog,viewBlog,postBlog,blogDetails,getAllBlogs,blogLogOut} = require('../Controller/blogController');
const AuthJwt=require('../middle-ware/isAuth');
const CreateBlog=require('../middle-ware/createBlog');
const ViewBlog=require('../middle-ware/viewBlog');
const multer=require('multer');
const path=require('path');

const fileStorage=multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,path.join(__dirname,"..","uploads","auth"),(err,data)=>{
            if(err) throw err;
        })
    },
    filename:(req,file,callback)=>{
        callback(null,file.originalname,(err,data)=>{
            if(err) throw err;
        })
    }
})
const fileFilter=(req,file,callback)=>{
    if(
        file.mimetype.includes('png')||
        file.mimetype.includes('jpg')||
        file.mimetype.includes('jpeg')||
        file.mimetype.includes('webp')
    ){
        callback(null,true);
    }else{
        callback(null,false);
    }
}
const upload=multer({
    storage:fileStorage,
    fileFilter:fileFilter,
    limits:{fieldSize:1024*1024*5},
});
const upload_type=upload.array('blog_img','10');

router.get('/',getReg);
router.post('/auth/postdata',postReg);
router.get('/mail_confirmation/:email/:token',mailVerification);
router.get('/auth/logindata',getLog);
router.post('/auth/postlogin',postLog);
router.get('/blog/getdash',AuthJwt.authJwt,userAuth,getDash);
router.get('/blog/create/:email',createBlog);
router.get('/blog/add',CreateBlog.createBlog,viewBlog);
router.post('/blog/postdata',upload_type,postBlog);
router.get('/blog/viewdata/:email',blogDetails);
router.get('/blog/getAllBlogs',ViewBlog.viewBlog,getAllBlogs);
router.get('/blog/logout',blogLogOut);

module.exports=router;