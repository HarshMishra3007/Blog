require('dotenv').config();
const express=require('express');
const expressLayout=require('express-ejs-layouts');
const cookieParser= require('cookie-parser');
const MongoStore=require('connect-mongo');
const connectDb=require('./server/config/db');
const session=require('express-session');
const app=express();
const port=9000;
const methodOverride=require('method-override');
app.use(methodOverride('_method'));
connectDb();
app.use(expressLayout);
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    }),

}));

app.use(express.json());
app.set('layout','./layouts/main');
app.set('view engine','ejs');
app.use(express.static('public'));

app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));

app.listen(port,()=>{
    console.log("App listening on port ${port}");
});