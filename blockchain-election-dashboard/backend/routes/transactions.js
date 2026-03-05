const router = require("express").Router();
const { getTransactions } = require("../fabricListener");

router.get("/",(req,res)=>{
 res.json(getTransactions());
});

module.exports = router;