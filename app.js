var express = require("express");
var app = express();
var bodyparser = require("body-parser");

var fs = require('fs');
var formidable = require('formidable')

var mysql = require('mysql2/promise');

var new_con = mysql.createPool({
	host: "192.168.64.2",
    user: "naijith",
    password: "naijith",
	database: "digitalGrocery"
  });


app.use(express.static('./images'));
app.use(express.static('./css'));
app.set("view engine" , "ejs");
app.use(bodyparser.urlencoded({extended : true}));

var groceryList = []
app.get("/groceryList",(req,res)=>{
    console.log("printing list");
    res.render("groceryList.ejs", {groceryList:groceryList});
});


app.get("/",(req,res)=>{

    new_con.query("SELECT * FROM items", function(err,result,fields){
        if (err){
          console.log(err)
          return
        }
        res.render("customer.ejs" , {items:result});
    })
    console.log("customer"); 
})

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
    });

    res.redirect("/admin");   
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

app.post("/submit_list" , (req,res)=>{
    var name=req.body.item_name;

    res.redirect("/")
});

app.listen("3000",()=>{
    console.log("server hosted......")
});