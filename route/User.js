const express=require('express');
const route=express.Router();
const UserController=require('../Controller/UserController')

route.get('/',UserController.home)

route.get('/dashboard',UserController.userAuth,UserController.dashboard)

route.get('/register',UserController.register)

route.post('/Sign-up',UserController.registerCreate)

route.get("/confirmation/:email/:token",UserController.confirmation);

route.get('/login',UserController.login)

route.post('/Sign-in',UserController.loginCreate)

route.get('/logout',UserController.logout)


module.exports=route;