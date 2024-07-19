const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const AuthSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isVerify:{
        type:Boolean,
        required:false
    }
},{
    timestamps:true,
    versionKey:false,
});
const AuthModel=new mongoose.model('auth_details',AuthSchema);
module.exports=AuthModel;