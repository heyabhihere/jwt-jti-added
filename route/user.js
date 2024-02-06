//route/user.js
const express = require('express')
const controller = require("../controller/methods")
const verifyToken = require('../middleware/verify')

const router = express.Router()

router.post("/newuser", controller.postUsers)
router.put("/addmarks/:id", controller.addMarks)
router.get("/users", controller.getUsers)
router.get("/login/:email/:pass",controller.loginUser)
router.get("/login",verifyToken,controller.loginUserToken)
router.get("/user/:_id", controller.getUser)
router.put("/updateuser/:_id", controller.updateUser)
router.delete("/deleteuser/:id", controller.deleteUser)
module.exports = router;
