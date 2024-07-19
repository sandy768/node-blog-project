const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const BlogSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    blog_img:{
        type:[String],
        required:false
    }
},{
    timestamps:true,
    versionKey:false,
});
const BlogModel=new mongoose.model('blog_details',BlogSchema);
module.exports=BlogModel;