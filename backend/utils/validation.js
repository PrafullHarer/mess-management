const Joi = require('joi');

const schemas = {
    login: Joi.object({
        mobile: Joi.string().required(),
        password: Joi.string().required()
    }),
    studentAdd: Joi.object({
        name: Joi.string().required(),
        mobile: Joi.string().pattern(/^[0-9]+$/).min(10).max(10).required(),
        password: Joi.string().min(6).required(),
        // New plan-based fields
        plan: Joi.string().optional(),
        amount: Joi.number().integer().min(0).optional().allow(null),
        paid: Joi.number().integer().min(0).optional().allow(null),
        diet: Joi.string().valid('Veg', 'Non Veg').optional(),
        studentHolidays: Joi.array().items(Joi.string()).optional(),
        paymentNotes: Joi.string().optional().allow(''),
        gender: Joi.string().valid('boys', 'girls').optional(),
        // Legacy fields (still accepted)
        meal_slot: Joi.string().valid('AFTERNOON', 'NIGHT', 'BOTH').optional(),
        joined_at: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
        joiningDate: Joi.string().optional()
    }),
    studentEdit: Joi.object({
        name: Joi.string().optional(),
        mobile: Joi.string().pattern(/^[0-9]+$/).min(10).max(10).optional(),
        password: Joi.string().min(6).optional().allow(null, ''),
        status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
        // New plan-based fields
        plan: Joi.string().optional(),
        amount: Joi.number().integer().min(0).optional().allow(null),
        paid: Joi.number().integer().min(0).optional().allow(null),
        diet: Joi.string().valid('Veg', 'Non Veg').optional(),
        studentHolidays: Joi.array().items(Joi.string()).optional(),
        paymentNotes: Joi.string().optional().allow(''),
        gender: Joi.string().valid('boys', 'girls').optional(),
        // Legacy fields
        meal_slot: Joi.string().valid('AFTERNOON', 'NIGHT', 'BOTH').optional(),
        joined_at: Joi.alternatives().try(Joi.date(), Joi.string()).optional().allow(null, ''),
        joiningDate: Joi.string().optional().allow(null, '')
    }),
};

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }
    next();
};

module.exports = { schemas, validate };