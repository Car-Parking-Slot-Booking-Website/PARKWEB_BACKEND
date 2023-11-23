const express = require('express');
const router = express.Router(); // mini instance

router.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');
router.use(methodOverride('_Method'));

const City = require('../model/City');
const Location = require('../model/Location');

// Read
router.get('/cities', async (req, res) => {
    let cities = await City.find();
    res.render('cities/index', { cities });
})

// To Expand a particular City
router.get('/cities/:id', async (req, res) => {
    let { id } = req.params;
    let foundCity = await City.findById(id).populate('locations'); 
    console.log(foundCity);
    res.render('locations/index', { foundCity });
})

//ADMIN ROUTES :

// --> Read
router.get('/admin/cities', async (req, res) => {
    let cities = await City.find();
    res.render('cities/adminIndex', { cities });
})


// --> To Show a Particular City
router.get('/admin/cities/:id', async (req, res) => {
    let { id } = req.params;
    let foundCity = await City.findById(id).populate('locations'); 
    // console.log(foundCity);
    res.render('cities/show', { foundCity });
})

// --> DELETE THE EXISTING City
router.delete('/admin/city/:id' , async(req,res)=>{
    let {id} = req.params;
    let city = await City.findById(id);
    
    for (let idd of city.locations) {
        await Location.findByIdAndDelete(idd);
    }

    await City.findByIdAndDelete(id);
    res.redirect('/admin/cities');
})

// --> SHOW A NEW FORM
router.get('/admin/city/new' , (req,res)=>{
    res.render('cities/new');
})

// ACTUALLY ADDING IN THE DATABASE
router.post('/admin/cities' , async(req,res)=>{
    let {name,img } = req.body;
    await City.create({name,img});
    res.redirect('/admin/cities');
})



module.exports = router;
