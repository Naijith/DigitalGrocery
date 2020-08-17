var express = require("express");
var app = express();
var bodyparser = require("body-parser");

app.set("view engine" , "ejs");
app.use(bodyparser.urlencoded({extended : true}));

var groceryList = []

app.get("/groceryList",(req,res)=>{
    console.log("printing list");
    res.render("groceryList.ejs", {groceryList:groceryList});
});

app.get("/",(req,res)=>{
    console.log("adding to list");
    res.render("customer.ejs");
});

app.post("/newitem" , (req,res)=>{
    console.log("item added");
    var item = req.body.item;
    groceryList.push(item);
    res.redirect("/")
});

app.listen("3000",()=>{
    console.log("server hosted......")
});
