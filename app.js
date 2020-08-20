var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var formidable = require('formidable');
var mysql = require('mysql2/promise');
var path = require('path');
var createError = require('http-errors');
const { createSecretKey } = require("crypto");

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
const PORT = process.env.PORT || 4000;
var new_con = mysql.createPool({
  host: "192.168.64.2",
  user: "naijith",
  password: "naijith",
  database: "digitalGrocery"
  });
var lists = [];

app.set("view engine" , "ejs");
app.use(express.static('./images'));
app.use(express.static('./css'));
app.use(bodyparser.urlencoded({extended : true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/",(req,res)=>{
  new_con.query("SELECT * FROM items", function(err,result,fields){
      if (err){
        console.log(err)
        return
      }
      res.render("customer.ejs" , {items:result});
  })
  console.log("customer"); 
});

app.get("/admin",(req,res)=>{
  new_con.query("SELECT * FROM items", function(err,result,fields){
    if (err){
      console.log(err)
      return
    }
    res.render("admin.ejs" , {items:result});
  })
  console.log("admin"); 
})

app.post("/add_item" , (req,res)=>{
  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
    if (err) {
        console.log(err);
    }
  
    var name = fields.item_name;
    var imageType = "."+files.item_image.name.split(".").pop();
    var price = fields.item_price;
    var quantityType = fields.item_quantity_type;

    var oldpath = files.item_image.path;
    var newpath = './images/' + name+imageType;

    fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        console.log("success");
    });

    new_con.query("INSERT INTO items (id,name,imageType,price,quantityType) VALUES (?,?,?,?,?)",[null,name,imageType,price,quantityType], function(err,result){
        if (err){
          console.log(err);
        } 
    })
  res.redirect("/admin"); 
  });   
});

app.get("/delete_item/:name/:imageType" ,(req,res)=>{
  var name = req.params.name;
  var imageType = req.params.imageType;

  fs.unlinkSync('./images/'+name+imageType, function (err) {
    if (err) throw err;
    console.log('File deleted!');
  }); 

  new_con.query("DELETE FROM items WHERE items.name = ?",[name], function(err,result){
    if (err){
      console.log(err);
    }
  });
  console.log('item deleted!');
  res.redirect("/admin");
});

app.post("/new_order" , (req,res)=>{
  lists.push(req.body.list);
  io.emit('message', req.body.list);
  console.log("new order submitted");
});

app.get("/lists",(req,res)=>{
  res.render("lists.ejs",{lists:lists});
});

// app.use(function(req, res, next) {
//   next(createError(404));
// });
// app.use(function(err, req, res, next) {
//   res.json(err.message);
//   res.render('error.ejs');
// });

http.listen(PORT,() => console.log(`Server up on port ${PORT}`));

module.exports=app;