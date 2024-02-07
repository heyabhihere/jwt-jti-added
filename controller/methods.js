const express = require('express')
const { error } = require('console');
const { user } = require('../database/db');
const bcrypt = require('bcrypt')
const validation = require('../validation');
const secretkey = "8989898988"
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const marks = require('../database/marks')
const app = express()
app.use(express.json())

module.exports.postUsers = async (req, res) => {
    try {
        await validation.userSchema.validateAsync(req.body)
        const { email, phoneNum } = req.body;
        const existingUser = await user.findOne({ $or: [{ email }, { phoneNum }] });

        if (existingUser) {
            return res.status(400).json({ msg: "user already exsit" })
        }
        else {
            const hash_password = await bcrypt.hash(req.body.pass, 10);
            req.body.pass = hash_password;
            await user.create(req.body)
            return res.json("User created")
        }
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
        const userHaiJaNhi = await user.findOne({ _id: id })
        if (userHaiJaNhi) {
            await user.deleteOne({ _id: id });
            return res.send({
                msg: "User Deleted"
            });
        }else{
            return res.json({msg:"User does not exist."})
        }
    } catch {
        console.error(error)
        return res.status(400).json({
            msg: "User not found"
        })
    }
}


module.exports.updateUser = async (req, res) => {
    try {

        await validation.updateSchema.validateAsync(req.body);

        const existinguser = await user.findOne(req.params)
        if (!existinguser) {
            return res.status(400).json({
                msg: "user does not exist"
            })
        }
        const filter = req.params;
        await user.findOneAndUpdate(filter, validatedUpdate);
        return res.json({
            msg: "updated"
        });
    } catch (error) {
        console.error(error)
        return res.status(400).json({
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
        return res.status(400).json({
            msg: "Users not found"
        })
    }
}


module.exports.getUser = async (req, res) => {
    try {
        const data = await user.findOne(req.params)
        if(!data){
            return res.json({msg:"User doest not exist."})
        }
        return res.json(data)
    } catch (error) {
        console.error(error)
        return res.status(400).json({
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
        const input = req.params.input;
        const password = req.params.pass;
        let student;
        if (input.includes('@')) {
            student = await user.findOne({ email: input });
        } else {
            student = await user.findOne({ phoneNum: input });
        }

        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }
        // Compare
        bcrypt.compare(password, student.pass, async function (err, result) {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            if (result) {
                // If passwords match
                const uid = student._id;
                const jti = uuidv4()
                const token = await jwt.sign({ uid, jti }, secretkey)
                res.json({ token });
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
    jwt.verify(req.token, secretkey, async (err, authData) => {
        if (err) {
            res.send({ msg: "invalid token" })
        } else {
            try {
                const userData = await user.findOne({ _id: authData.uid })
                if (!userData) {
                    return res.status(400).json({ msg: "user not found" })

                }
                res.json({
                    msg: "Profile accessed",
                    user: userData
                })
            } catch (error) {
                console.error(error);
                res.status(500).json({ msg: "Internal server error" });
            }
        }
    })
}



