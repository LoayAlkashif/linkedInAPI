import Joi from "joi";

export const addCompanyValidation = Joi.object({
  companyName: Joi.string().required(),
  description: Joi.string().required(),
  industry: Joi.string().required(),
  address: Joi.string().required(),
  numberOfEmployees: Joi.object().required(),
  companyEmail: Joi.string().email().required(),

});
