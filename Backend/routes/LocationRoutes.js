const express = require('express');
const router = express.Router(); // mini instance

router.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');

router.use(methodOverride('_Method'));

const Location = require('../model/Location');
const City = require('../model/City');
const SP = require('../model/SP');




// To Expand a particular Location
router.get('/locations/:id', async (req, res) => {
    let { id } = req.params;
    let foundLocation = await Location.findById(id).populate('sp'); 
    // console.log(foundLocation);
    res.render('services/index', { foundLocation });
    // res.send(req.params);
})

// ADMIN ROUTES:

//to add a location
router.post('/cities/:id/location', async (req, res) => {
    let { id } = req.params;
    let { name,img } = req.body;

    let city = await City.findById(id);
    let location = new Location({ name,img });

    city.locations.push(location);

    await city.save();
    await location.save();

    res.send('location stored successfully');
    // res.redirect('/admin/cities/:id');

})

// To show a particlar location
router.get('/admin/locations/:id', async (req, res) => {
    let { id } = req.params;
    let foundLocation = await Location.findById(id).populate('sp'); 
    console.log(foundLocation);
    res.render('locations/show', { foundLocation });
})


// DELETE THE EXISTING LOCATION
router.delete('/admin/location/:id' , async(req,res)=>{
    let {id} = req.params;
    let location = await Location.findById(id);
    
    for (let idd of location.sp) {
        await SP.findByIdAndDelete(idd);
    }

    await Location.findByIdAndDelete(id);
    res.redirect('/admin/cities');
})




module.exports = router;