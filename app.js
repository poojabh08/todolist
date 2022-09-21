//EJS - EMBEDDED JAVASCRIPt TEMPLATING
// https://ejs.co

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

// const items = ["Buy Food", "Cook Food"];
// const workItems = [];

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-akshit:Test123@cluster0.vtol8ju.mongodb.net/todoListDB");

const itemsSchema = {
    name: String
}

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
    name: "Bring Food"
})


const item2 = new Item({
    name: "Cook Food"
})


const item3 = new Item({
    name: "Eat Food"
})

const defaultItems = [item1,item2,item3] 

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);

app.get("/",function(req,res){
    // const day = date.getDate();
    Item.find({},function(err, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err)
                    console.log(err);
                else{
                    // mongoose.connection.close();
                    console.log("Inserted successfully");
                }
            })   
            res.redirect("/");        
        }        
        else{
            // console.log(dbItems);
            res.render("list",{listTitle: "Today", newItem:foundItems});
        }
    })

})

app.post("/",function(req,res){
    const newItem = req.body.item;
    const listName = req.body.list;

    const item4 = new Item({
        name: newItem
    })
    
    if(listName === "Today"){
        item4.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            if(err)
                console.log(err);
            else{
                foundList.items.push(item4);
                foundList.save();
                res.redirect("/"+listName);
            }
        })
    }
    
        
})

app.post("/delete",(req,res)=>{
    const checkedItemID = req.body.check;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndDelete(checkedItemID, function(err){
            if(err)
                console.log(err);
            else{
                console.log("Successfully deleted");
                res.redirect("/");
            }
        })
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}}, function(err, foundItems){
            if(err)
                console.log(err);
            else{
                res.redirect("/"+listName);
            }
        })
    }
})

app.get("/about",function(req,res){
    res.render("about");
})


// app.get("/work",function(req,res){
//     res.render("list",{listTitle: "Work List", newItem: workItems});
// })


app.get("/:customPage",(req,res)=>{
    const customPage = _.capitalize(req.params.customPage);

    List.findOne({name: customPage}, function(err, foundList){
        if(err)
            console.log(err);
        else{
            if(foundList){
                res.render("list", {listTitle: foundList.name, newItem:foundList.items})
            }
            else{
                const list = new List({
                    name: customPage,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+ customPage);
            }
        }
    })  
})


// app.post("/work",(req,res)=>{
//     const item=req.body.item;
//     workItems.push(item);
//     res.redirect("/work");
// })

app.listen(3000, function(){
    console.log("Listening on port 3000");
})