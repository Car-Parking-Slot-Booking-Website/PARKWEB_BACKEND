const express = require('express');
const router = express.Router(); // mini instance
router.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');

  
router.get('/homepage',(req,res)=>{
    res.render('parkapp/index');
});

router.get('/login',(req,res)=>{
    res.render('parkapp/loginmain');
})

router.get('/loginadmin',(req,res)=>{
    res.render('parkapp/loginadmin');
})

router.get('/loginuser',(req,res)=>{
    res.render('parkapp/loginuser');
})

router.get('/signup',(req,res)=>{
    res.render('parkapp/signup');
})

router.get('/phonelogin',(req,res)=>{
    res.render('parkapp/phone');
})

router.get('/about',(req,res)=>{
    res.render('parkapp/about');
})

router.get('/slotpayment',(req,res)=>{
    res.render('payment/slotpayment');
})


  
module.exports = router;
