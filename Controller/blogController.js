const AuthModel=require('../Model/authModel');
const BlogModel=require('../Model/blogModel');
const bcrypt=require('bcryptjs');
const nodemailer=require('nodemailer');
const jwt=require('jsonwebtoken');
const TokenModel=require('../Model/tokenModel');

const transport=nodemailer.createTransport({
    host:'smtp',
    port:465,
    secure:false,
    requireTLS:true,
    service:'gmail',
    auth:{
        user:'sandiptomajumdar@gmail.com',
        pass:'ndgc vtna ecif ofxw'
    }
})

const getReg=(req,res)=>{
    let email_success=req.flash('reg-success');
    if(email_success.length>0){
        email_success=email_success[0];
    }
    else{
        email_success=null;
    }

    let errMail=req.flash('error-mail');
    if(errMail.length>0){
        errMail=errMail[0];
    }
    else{
        errMail=null;
    }

    let verifyMail=req.flash('msg');
    if(verifyMail.length>0){
        verifyMail=verifyMail[0];
    }
    else{
        verifyMail=null;
    }

    let errToken=req.flash('err-token');
    if(errToken.length>0){
        errToken=errToken[0];
    }
    else{
        errToken=null;
    }
    res.render('auth/registration',{
        title:"Sign Up",
        path:"/",
        mail_success:email_success,
        errorMail:errMail,
        verify_mail:verifyMail,
        errorToken:errToken
    })
}
const postReg=async(req,res)=>{
    try{
        // console.log("Collected data:",req.body);
        let email_verify=await AuthModel.findOne({email:req.body.email});
        if(!email_verify){
            let hashPassword=await bcrypt.hash(req.body.password,12);
            let details=new AuthModel({
                email:req.body.email,
                password:hashPassword,
            });
            let saved=await details.save();
            if(saved){
                // console.log("Data saved successfully:",saved);
                const token_jwt=jwt.sign(
                    {email:req.body.email},
                    "secretkey8628929@435367811",
                    {expiresIn:"3h"}
                );
                const Token_data=new TokenModel({
                    token:token_jwt,
                    _userId:saved._id,
                });
                let token_save=await Token_data.save();
                if(token_save){
                    let mailTransport={
                        from:'sandiptomajumdar@gmail.com',
                        to:req.body.email,
                        subject:"Email Verification",
                        text:'Hello'+" "+req.body.email+'\n\n'+
                        ',\n\nYou have successfully submitted your data to be registered.Please verify your account by clicking the link:\n'+
                        'http://'+
                        req.headers.host+
                        '/mail_confirmation/'+
                        req.body.email+
                        '/'+
                        token_jwt+
                        '\n\nThank you!\n'
                    }
                    transport.sendMail(mailTransport,function(error,info){
                        if(error){
                            console.log("Error to send mail",error);
                            res.redirect('/');
                        }
                        else{
                            req.flash('reg-success','Successfully registered, Please check your gmail for verification');
                            res.redirect('/');
                        }
                    })
                }
            }
        }
        else{
            req.flash('error-mail','Email already exists');
            res.redirect('/');
        }
    }
    catch(err){
        console.log("Error while collecting data",err);
    }
}
const mailVerification=async(req,res)=>{
    try{
        let token_data=await TokenModel.findOne({token:req.params.token});
        // console.log(token_data);
        if(token_data){
            // console.log("Received mail from confirmation mail",req.params.email);
            let user_data=await AuthModel.findOne({email:req.params.email});
            if(user_data.isVerify){
                // console.log("User already verified");
                req.flash('msg','User already verified, go to login');
                res.redirect('/');
            }
            else{
                user_data.isVerify=true;
                let save_res=await user_data.save();
                if(save_res){
                    // console.log("Your account is successfully verified");
                    req.flash('success-verify','You have successfully verified, Sign In now')
                    res.redirect('/auth/logindata');
                }
            }
        }
        else{
            req.flash('err-token','Link is expired, Please go to your mail section again for mail verification');
            res.redirect('/')
        }
    }
    catch(err){
        console.log("Error while mail verification",err);
    }
}
const getLog=(req,res)=>{
    let successVerify=req.flash('success-verify');
    if(successVerify.length>0){
        successVerify=successVerify[0];
    }
    else{
        successVerify=null;
    }

    let mailErr=req.flash('mail-err');
    if(mailErr.length>0){
        mailErr=mailErr[0];
    }
    else{
        mailErr=null;
    }

    let errPass=req.flash('err-pass');
    if(errPass.length>0){
        errPass=errPass[0]
    }
    else{
        errPass=null;
    }

    let errLog=req.flash('err-log');
    if(errLog.length>0){
        errLog=errLog[0];
    }
    else{
        errLog=null;
    }

    let errDash=req.flash('err-dash');
    if(errDash.length>0){
        errDash=errDash[0];
    }
    else{
        errDash=null;
    }
    res.render('auth/login',{
        title:"Sign In",
        path:"/auth/logindata",
        verifySuccess:successVerify,
        mailError:mailErr,
        errorPass:errPass,
        errorLog:errLog,
        errorDash:errDash
    })
}
const postLog=async(req,res)=>{
    try{
        let old_data=await AuthModel.findOne({email:req.body.email});
        if(old_data){
            let pass_match=await bcrypt.compare(req.body.password,old_data.password);
            if(pass_match){
                if(old_data.isVerify==true){
                    let token_payload={userdata:old_data};
                    const token_jwt=jwt.sign(token_payload,process.env.SECRET_KEY,{
                        expiresIn:"1h",
                    });
                    res.cookie("token_data",token_jwt,{
                        expires:new Date(Date.now()+ 10800000),
                        httpOnly:true,
                    });
                    res.redirect('/blog/getdash');
                }
                else{
                    req.flash('err-log','Invalid user, Please verify your email through verification link');
                    res.redirect('/auth/logindata');
                }
                
            }
            else{
                req.flash('err-pass','Incorrect password');
                res.redirect('/auth/logindata');
            }
        }
        else{
            req.flash('mail-err','Invalid email');
            res.redirect('/auth/logindata');
        }
    }
    catch(err){
        console.log("Error to collect login data",err);
    }
}
const  userAuth=async(req,res,next)=>{
    try{
        if(req.user){
            next();
        }
        else{
            req.flash('err-dash','You need to login first');
            res.redirect('/auth/logindata');
        }
    }
    catch(err){
        throw err;
    }
}
const getDash=(req,res)=>{
    let user_data=req.user.userdata;
    // console.log("User data:",user_data);

    let errUser=req.flash('err-user');
    if(errUser.length>0){
        errUser=errUser[0];
    }
    else{
        errUser=null;
    }

    let errView=req.flash('err-view');
    if(errView.length>0){
        errView=errView[0];
    }
    else{
        errView=null;
    }
    res.render('auth/dashboard',{
        title:"Blog Dashboard",
        path:'/blog/getdash',
        data:user_data,
        errorUser:errUser,
        errorView:errView
    })
}
const createBlog=async(req,res)=>{
    try{
        let auth_data=await AuthModel.findOne({email:req.params.email});
        if(auth_data){
            let token_payload={authData:auth_data};
            let jwt_token=jwt.sign(token_payload,process.env.SECRET_KEY,{
                expiresIn:"1h",
            });
            res.cookie('token_details',jwt_token,{
                expires:new Date(Date.now()+10800000),
                httpOnly:true,
            });
            res.redirect('/blog/add');
        }
        else{
            req.flash('err-user','Error to find user');
            res.redirect('/blog/getdash');
        }
    }
    catch(err){
        console.log("Error to show create blog page");
    }
}
const viewBlog=(req,res)=>{
    let successAdd=req.flash('success-add');
    if(successAdd.length>0){
        successAdd=successAdd[0];
    }
    else{
        successAdd=null;
    }
    let user_auth=req.user.authData;
    // console.log("User Auth Data:",user_auth);
    res.render('auth/add_blog',{
        title:"Add Blog",
        info:user_auth,
        success_add:successAdd
    })
}
const postBlog=async(req,res)=>{
    try{
        let blog_images=req.files.map(images=>images.filename);
        let blog_details=new BlogModel({
            email:req.body.email,
            title:req.body.title.toLowerCase(),
            desc:req.body.desc.toLowerCase(),
            blog_img:blog_images,
        });
        let saved_details=await blog_details.save();
        if(saved_details){
            // console.log("Blog data is saved successfully",saved_details);
            req.flash('success-add','Blog is added successfully');
            res.redirect('/blog/add');
        }
    }
    catch(err){
        console.log("Error to collect blog data",err);
    }
}
const blogDetails=async(req,res)=>{
    try{
        let blog_details=await BlogModel.aggregate([
            {
                $lookup:{
                    from:'auth_details',
                    let:{
                        emailId:'$email'
                    },
                    pipeline:[
                        {
                            $match:{
                                $expr:{
                                    $and:[{$eq:[req.params.email,'$$emailId']}],
                                },
                            },
                        },
                    ],
                    as:'viewBlog',
                },
            },
            {
                $unwind:{
                    path:'$viewBlog',
                },
            },
            {
                $project:{
                    createdAt:0,
                    updatedAt:0,
                    'viewBlog.createdAt':0,
                    'viewBlog.updatedAt':0,
                    'viewBlog.isVerify':0,
                },
            },
        ]);
        // console.log("All created blogs:",blog_details);
        if(blogDetails){
           let token_payload={blogData:blog_details};
           let tokenJwt=jwt.sign(token_payload,process.env.SECRET_KEY,{
            expiresIn:"1h",
           });
           res.cookie('token_blog',tokenJwt,{
            expires:new Date(Date.now()+10800000),
            httpOnly:true,
           });
           res.redirect('/blog/getAllBlogs');
        }
        else{
            req.flash('err-view','Error to find blog data');
            res.redirect('/blog/getdash');
        }
    }
    catch(err){
        console.log("Error to find blog data",err);
    }
}
const getAllBlogs=(req,res)=>{
    let allBlogs=req.user.blogData;
    if(allBlogs){
        res.render('auth/view_blog',{
            title:"All Blogs",
            data:allBlogs
        })
    }
}
const blogLogOut=async (req,res)=>{
    let destroy=await res.clearCookie("token_data");
    // console.log("Destroyed cookie data:",destroy);
    if(destroy){
        res.redirect('/auth/logindata');
    }
}
module.exports={
    getReg,
    postReg,
    mailVerification,
    getLog,
    postLog,
    userAuth,
    getDash,
    createBlog,
    viewBlog,
    postBlog,
    blogDetails,
    getAllBlogs,
    blogLogOut
}