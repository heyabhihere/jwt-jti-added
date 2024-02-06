const express = require('express')
const { error } = require('console');
const { user } = require('../database/db');
const bcrypt = require('bcrypt')
const validation = require('../validation');
const secretkey = "8989898988"
const {v4:uuidv4}=require('uuid')
const jwt = require('jsonwebtoken')

const marks = require('../database/marks')
const app = express()
app.use(express.json())

module.exports.postUsers = async (req, res) => {
    try {
        await validation.userSchema.validateAsync(req.body)
        const hash_password = await bcrypt.hash(req.body.pass, 10);
        req.body.pass = hash_password;
        await user.create(req.body)
        return res.json("User created")
    } catch {
        console.error(error)
        return res.status(400).json({
            msg: "Bad request"
        })
    }
};


module.exports.deleteUser = async (req, res) => {
    try {

        const id = req.params.id;
        await user.deleteOne({ _id: id });
        return res.send({
            msg: "User Deleted"
        });
    } catch {
        console.error(error)
        return res.status(404).json({
            msg: "User not found"
        })
    }
}


module.exports.updateUser = async (req, res) => {
    try {

        await validation.updateSchema.validateAsync(req.body);

        const existinguser = await user.findOne(req.params)
        console.log(existinguser, "---")
        if (!existinguser) {
            return res.status(404).json({
                msg: "user not found"
            })
        }
        const filter = req.params;

        await user.findOneAndUpdate(filter, validatedUpdate);

        return res.json({
            msg: "updated"
        });
    } catch (error) {
        console.error(error)
        return res.status(404).json({
            msg: "User not found"
        })
    }
}


module.exports.getUsers = async (req, res) => {
    try {
        const users = await user.find({})
        return res.json({ users });
    } catch {
        console.error(error)
        return res.status(404).json({
            msg: "Users not found"
        })
    }
}


module.exports.getUser = async (req, res) => {
    try {

        const data = await user.find(req.params)
        return res.json(data)
    } catch (error) {
        console.error(error)
        return res.status(404).json({
            msg: "Users not found"
        })
    }
}


module.exports.addMarks = async (req, res) => {
    try {
        await validation.addMarksSchema.validateAsync(req.body);
        const id = req.params.id;
        const existingUser = await user.findOne({ _id: id });

        if (!existingUser) {
            return res.status(400).json({
                msg: 'User does not exist',
            });
        }
        await marks.marks.create({
            id: req.params.id,
            subject: req.body.subject,
            marks: req.body.marks
        });

        return res.json({
            msg: "Marks added"
        });
    }

    catch (error) {
        console.error(error);
        return res.status(400).json({
            msg: "Bad request"
        });
    }
}



module.exports.loginUser = async (req, res) => {
    try {
        const emailId = req.params.email;
        const password = req.params.pass;
        const student = await user.findOne({ email: emailId });
        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }
        // Compare
        bcrypt.compare(password, student.pass, function (err, result) {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            if (result) {
                // If passwords match
                const uid = student._id;
                const jti=uuidv4()
                jwt.sign({ uid,jti }, secretkey, { expiresIn: '60s' }, (error, token) => {
                    if (error) {
                        console.error("Error generating token:", error);
                        return res.status(500).json({ error: "Internal server error" });
                    }
                    res.json({ token });
                });
            } else {
                res.status(401).json({ msg: "Invalid password" });
            }
        });
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}




module.exports.loginUserToken = async (req, res) => {
    jwt.verify(req.token, secretkey, (err, authData) => {
        if (err) {
            res.send({ msg: "invalid token" })
        } else {
            res.send({
                msg: "Profile accessed",
                authData
            })
        }
    })
}



