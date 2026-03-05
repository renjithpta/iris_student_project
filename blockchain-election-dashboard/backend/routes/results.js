const router = require("express").Router();
const db = require("../db");

router.get("/",async(req,res)=>{

 const results = await db.query(
  "SELECT * FROM election_results ORDER BY vote_count DESC"
 );

 res.json(results.rows);

});

module.exports = router;