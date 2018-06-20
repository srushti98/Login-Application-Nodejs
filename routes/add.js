var express = require('express');
const path1 = require('path');
let Article=require('../models/articles');
const crypto=require('crypto');
const multer  = require('multer');
const GridFsStorage=require('multer-gridfs-storage');
var router = express.Router();
//get in multer

//var upload = multer({ dest: 'public/uploads/' });

/*const storage=multer.diskStorage({
   destination:function (req,file,cb) {
       cb(null,'./uploads/');
   },
   filename:function (req,file,cb) {
       cb(null,new Date().toISOString()+file.originalname);

   }
});*///originalname
//const upload=multer({storage:storage});
//create storage engine
const storage = new GridFsStorage({
    url: 'mongodb://localhost/nodekb',
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path1.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
var upload = multer({ storage:storage });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('add', { title: 'add articles' });
    // res.render('index');
});
var cpUpload = upload.fields([{ name: 'file' }, { name: 'file2'}]);
//app.post('/cool-profile', cpUpload, function (req, res, next) {
    // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
    //
    // e.g.
    //  req.files['avatar'][0] -> File
    //  req.files['gallery'] -> Array
    //
    // req.body will contain the text fields, if there were any
//})
//router.post('/',upload.single('file'),function (req,res) {
router.post('/',cpUpload,function (req,res) {
    console.log(req.file);
    req.checkBody('title','Title is required').notEmpty();
    req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    //get errors

    let errors=req.validationErrors();

    if(errors)
    {
        res.render('add',{
            title: 'add articles',
           errors:errors
        });
    }
    else
    {
        let article=new Article();
        article.title=req.body.title;
        article.author=req.body.author;
        article.body=req.body.body;
        //gets in file path
        //article.file=req.file.filename;   //for single file
        article.file=req.files['file'][0].filename;
        article.file2=req.files['file2'][0].filename;
        article.save(function (err) {
            if(err){
                console.log('its in save');
                console.log(err);
                return;
            }
            else
            {

                req.flash('success','Article added');
                console.log(req.files);
                res.redirect('/');
            }

        });
    }


});
module.exports = router;