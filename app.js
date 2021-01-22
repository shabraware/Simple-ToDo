const express = require("express");
const bodyParser = require("body-parser");
const today = require(__dirname + "/date");
const app = express();
const _ = require("lodash");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//Databases
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://admin:01154251620@cluster0.21f2n.mongodb.net/ToDoListDB?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
  console.log("we're connected!");
});

const itemSchema = {
  name: String,
};

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({ name: "Welcome to out ToDo list :)" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "Hit this <- to delete the item." });

const defaulItems = [item1, item2, item3];

//CREATE NEW COLLECTION FOR THE CUSTOM LISTS
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema], //Array of items
});

const List = mongoose.model("list", listSchema);

app.get("/", (req, res) => {
  Item.find({}, (err, items) => {
    if (err) console.log(err);
    else {
      if (items.length === 0) {
        Item.insertMany(defaulItems, (err) => {
          if (err) console.log(err);
          else console.log("Default items is inserted successfully :)");
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: today, newItems: items });
      }
    }
  });
});

app.get("/:listName", (req, res) => {
  const listName = _.capitalize(req.params.listName);
  List.findOne({ name: listName }, (err, list) => {
    if (err) console, log(err);
    else {
      if (!list) {
        //no list with this name exists
        const list = new List({
          name: listName,
          items: defaulItems,
        });
        list.save();
        res.redirect(`/${listName}`);
      } else {
        res.render("list", { listTitle: list.name, newItems: list.items });
      }
    }
  });
});

app.post("/", (req, res) => {
  const newItem = req.body.newItem;
  const listName = req.body.button;
  //if (newItem.trim().length !== 0) {}
  const item = new Item({ name: newItem });
  if (listName === today) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, list) => {
      if (err) console.log(err);
      else {
        list.items.push(item);
        list.save();
        res.redirect(`/${listName}`);
      }
    });
  }
});
app.post("/delete", (req, res) => {
  const itemID = req.body.deleteCheckbox;
  const listTitle = req.body.listTitle;
  if (listTitle === today) {
    Item.findByIdAndDelete(itemID, (err) => {
      if (err) console.log(err);
      else console.log("item deleted from the database");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listTitle },
      { $pull: { items: { _id: itemID } } },
      (err, list) => {
        if (err) console.log(err);
        else res.redirect(`/${listTitle}`);
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log("Server started on port 3000");
});

