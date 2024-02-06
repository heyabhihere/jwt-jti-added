const Joi = require('joi');

const userSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().optional(),
    email: Joi.string().email().required(),
    dialCode: Joi.string().optional(),
    phoneNum: Joi.string().length(10).pattern(/^[0-9]+$/),
    pass:Joi.string().required()
});

const updateSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string().email(),
    dialCode: Joi.string(),
    phoneNum: Joi.string()
});

const addMarksSchema = Joi.object({
    subject: Joi.string().required(),
    marks: Joi.number().required(),
});

module.exports={userSchema,updateSchema,addMarksSchema};

