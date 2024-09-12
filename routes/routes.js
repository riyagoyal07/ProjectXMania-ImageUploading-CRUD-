const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

//insert an user into  database route
router.post('/add', upload, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    try {
        await user.save();
        req.session.message = "User added successfully";
        return res.redirect('/');
    }
    catch (err) {
        res.status(500).send("internal error ");
    }


});


router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        const message = req.session.message;
        req.session.message = null;
        res.render("index", { title: "Home Page", users, message });
    }
    catch (err) {
        res.status(500).send("internal error");
    }

});


router.get('/add', (req, res) => {

    res.render('add_users', { title: "Add user page" })
});


//edit user route
router.get('/edit/:id', async (req, res) => {
    /*let id = req.params.id;
    User.findById(id,(err,user)=>{
        if(err){
            res.redirect('/');
        }
        else{
            if(user==null){
                res.redirect('/');
            }
            else{
                res.render("edit-user",{
                    title:"Edit User",
                    user:user,
                })
            }
        }
    })
})*/
    let id = req.params.id;
    try {
        const user = await User.findById(id).exec();
        if (!user) {
            return res.redirect('/');
        }
        res.render("edit_users", {
            title: "Edit user",
            user: user,
        })
    }
    catch (err) {
        res.redirect('/');
    }
});

// update user route
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if (res.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    }
    else {
        new_image = req.body.old_image;
    }
    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        })
        req.session.message = {
            type: "success",
            message: "user updated succeessfully",
        }
        res.redirect("/");
    }
    catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

// delete user route
router.get('/delete/:id',async(req,res)=>{
    let id = req.params.id;
    try{
     const result = await User.findByIdAndDelete(id).exec();
        if(result && result.image){
            try{
                fs.unlinkSync("./uploads/" +result.image);
            }
            catch(err){
                console.log(err);
            }
        }
        req.session.message={
               type:"info",
               message:"user deleted successfully",
            };
            res.redirect("/");
        }
    
    catch(err){
         //console.log(err);
         res.json({ message: err.message, type: "danger" });
    }
    })


module.exports = router;