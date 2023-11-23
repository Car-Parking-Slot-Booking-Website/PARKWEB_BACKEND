const express = require('express');
const router = express.Router(); // mini instance

router.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');

router.use(methodOverride('_Method'));

const Location = require('../model/Location');
const City = require('../model/City');
const SP = require('../model/SP');
const Slot = require('../model/Slot');






// ADMIN ROUTES

//to add a service provider

router.post('/locations/:id/sp', async (req, res) => {
    let { id } = req.params;
    let { name,img,number} = req.body;

    let location = await Location.findById(id);
    
    let availability = [];
    for (let i = 0; i < 24; i++){
        let newObj = {
            hour: i,
            isAvail:true
        }
        availability.push(newObj);
    }
    let sps = new SP({ name, img });
    // console.log(number);
    for (let i = 0; i<number; i++){
        let slot = new Slot({ availability });
        sps.slots.push(slot);
        await slot.save();
        await sps.save();
    }

    location.sp.push(sps);

    await location.save();
    await sps.save();

    res.send('service provider stored successfully');

})

// To show a particlar service provider
router.get('/admin/sp/:id', async (req, res) => {
    let { id } = req.params;
    let foundSP = await SP.findById(id); 
    // console.log(foundLocation);
    res.render('services/show', { foundSP });
})




module.exports = router;