const express = require("express");
const MongoClient = require("mongodb").MongoClient;
let count;
const MongUrl =
  process.env.NODE_ENV === "production"
    ? `mongodb://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PWD}@db`
    : `mongodb://db`;

MongoClient.connect(
  MongUrl,
  { useUnifiedTopology: true },
  async (err, client) => {
    if (err) {
      console.log(err);
    } else {
      console.log("CONNEXION DB OK !");
      count = client.db("test").collection("count");
      if ((await count.countDocuments()) === 0) {
        count.insertOne({ count: 0 });
      }
    }
  }
);

const app = express();

app.get("/api/count", (req, res) => {
  count
    .findOneAndUpdate({}, { $inc: { count: 1 } }, { returnNewDocument: true })
    .then((doc) => {
      const count = doc.value;
      res.status(200).json(count.count);
    });
});

app.all("*", (req, res) => {
  res.status(404).end();
});

app.listen(80);
