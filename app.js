const express=require("express");
const bodyparser=require("body-parser");
// const { default: mongoose, mongo } = require("mongoose");
const app=express();
const mongoose =require("mongoose");
var date=require(__dirname +"/date.js");

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

mongoose.connect('mongodb+srv://prathamghatkar:Pratham2002@cluster0.lhewq9c.mongodb.net/todolistdb',{ useUnifiedTopology: true,
useNewUrlParser: true});
const itemschema = {
  name:String,
}
const Item = mongoose.model("items",itemschema);

const i1= new Item({
      name:"welcome to your todolist"
})
const i2= new Item({
      name:"Hit the +  to add new item"
})
const i3= new Item({
      name:"<-- Hit this to delete an item"
})
const defaultitems=[i1,i2,i3];

var listschema = new mongoose.Schema;
listschema.add({
  name:String,
  item:[listschema]
})
const List = mongoose.model("List",listschema);



app.get("/",function (req,res) {

  Item.find({}).then(function (values,err) {
    if(values.length===0){
      Item.insertMany(defaultitems).then( (res,err)=> {
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully inserted");
        }
      });
      res.redirect("/");
    }
    else
    res.render('list',{listtitle:"today",newlistitem:values});
  });
  //   res.send("hellow world");
});


app.post("/",function (req,res) {
  // console.log(req.body);
  let item= req.body.newitem;

  let listtitle = req.body.list;
  
  const i1=new Item({name:item});

  if(listtitle === "today"){
    
    i1.save();
    res.redirect("/");
  }else{

        List.findOne({name:listtitle}).then(function (val,err) {
          if(!err){
            console.log(val.name);
             val.item.push(i1);
             val.save();
             res.redirect("/"+listtitle);   
             
          }
          
        })
  }


})

const _= require("lodash");
app.get("/:newlist",function (req,res) {
  const customlistname= _.capitalize(req.params.newlist);

  List.findOne({name:customlistname}).then(function (val,err) {
    if(!err){
      if(!val){

        const list = new List({
          name:customlistname,
          item:defaultitems
        });
        list.save();
        res.redirect("/"+customlistname);
      }
      
      else {
           
             res.render("list",{listtitle:val.name,newlistitem:val.item})
                  
           }
    }
  })

})
app.get("/about",function (req,res) {

        res.render('about');
  
       
})
app.post("/delete",function (req,res) {
  const listname = req.body.list;
  const itemid = req.body.checkbox;
  

  if(listname==="today"){

    
    Item.findByIdAndRemove(req.body.checkbox).then(function (val,err) {
     if(err) console.log(err);
     else { 
          res.redirect("/");
     }
    })
  }else{
    List.findOneAndUpdate({name:listname},{$pull:{item:{_id:itemid}}}).then(function (val,err) {
     if(err) console.log(err);
     else {
         
          res.redirect("/"+listname);
     }
    })
       

  }

})

app.listen("3000",function () {
    console.log("server started at port 3000");
})