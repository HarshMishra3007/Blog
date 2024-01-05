const express=require('express');
const router=express.Router();
const Post=require('../model/Post');
const User=require('../model/User');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const expressEjsLayouts = require('express-ejs-layouts');
const jwtSecret=process.env.JWT_SECRET;
// const authMiddleware=(req,res,next )=>{
//     const token=req.cookies.token;
//     if(!token){
//         return res.status(401).json({message:"Unauthorized"});
//     }
//     try{
//         const decoded=jwt.verify(token,jwtSecret);
//         req.userId=decoded.userId;
//         next();
//     }catch(error){
//         return res.status(401).json({message:"Unauthorized"});
//     }
// }
const authMiddleware=require('../config/authorization');

//const adminLayout='../views/layouts/admin';
router.get('/admin',async(req,res)=>{
try{
    const locals={
        title:"Admin",
        description:"Simple blog"
    }
    res.render('admin/index',{locals});
}catch(error){
    console.log(error);
}
});
router.post('/admin',async(req,res)=>{
    try{
      const {username,password}=req.body;
     const user=await User.findOne({username});
     if(!user){
        return res.status(401).json({message:"invalid credentials"});
     }
     const isPasswordValid=await bcrypt.compare(password,user.password);
     if(!isPasswordValid){
        return res.status(401).json({message:"invalid credentials"});
     }
     const token=jwt.sign({userId:user._id},jwtSecret);
      
     res.cookie('token',token,{httpOnly:true});
     console.log(res.cookie);
     res.redirect('/dashboard');
    }catch(error){
     console.log(error);
    }
});
router.get('/dashboard',authMiddleware,async(req,res)=>{
  try{
    const locals={
        title:'Dashboard',
        description:'Simple Blog'
    }
    const data=await Post.find();
    res.render('admin/dashboard',{
        locals,
        data
    });
  }catch(error){
console.log('error');
  }
    
});
router.get('/add-post',authMiddleware,async(req,res)=>{
    try{
      const locals={
          title:'Add Post',
          description:'Simple Blog'
      }
      res.render('admin/add-post',{
          locals,
      });
    }catch(error){
  console.log('error');
    }
      
  });
  router.post('/add-post',authMiddleware,async(req,res)=>{
    try{
     console.log(req.body);
    try{
       const newPost=new Post({
        title: req.body.title,
        body:req.body.body
       }) 
       await Post.create(newPost);
    }catch(error){
        console.log("error");
    }
      res.redirect('dashboard');
    }catch(error){
  console.log('error');
    }
  });
router.post('/register',async(req,res)=>{
    try{
      const {username,password}=req.body;
     const hashPassword=await bcrypt.hash(password,10);
     try{
        const user=await User.create({username,password:hashPassword});
        res.status(201).json({message:'User Created',user});
     }catch(error){
        if(error.code===11000){
            res.status(409).json({messgae:'User already in use'});
        }
        res.status(500).json({message:'Internal server error'});
     }
      
    }catch(error){
     console.log(error);
    }
});
router.get('/edit-post/:id',authMiddleware,async(req,res)=>{
    try{
        const locals={
            title:"NodeJs Blog",
            description:"Simple Blog"
        }
        let slug=req.params.id;
        const data=await Post.findOne({ _id:slug});
        res.render('admin/edit-post',{
           locals,
            data,
        });
    }catch(error){
        console.log(error);
    }
    });
  router.put('/edit-post/:id',authMiddleware,async(req,res)=>{
    try{
        const locals={
            title:"NodeJs Blog",
            description:"Simple Blog"
        }
        let slug=req.params.id;
        const data=await Post.findByIdAndUpdate(slug,{
            title:req.body.title,
            body:req.body.body,
            updatedAt:Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    }catch(error){
        console.log(error);
    }
    });
    router.delete('/delete-post/:id',authMiddleware,async(req,res)=>{
        try{
           await Post.deleteOne({_id:req.params.id});
           res.redirect('/dashboard');
            }catch(error){
            console.log(error);
        }
        });
module.exports=router;