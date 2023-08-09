'use strict'

const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().required(),
});

// Note schema for note creation
const createNoteSchema = Joi.object({
  type: Joi.string().valid('personal', 'work').required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
});

// Note schema for note update
const updateNoteSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
});

module.exports = {
  userSchema,
  createNoteSchema,
  updateNoteSchema
};