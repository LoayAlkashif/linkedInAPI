import { Router } from "express";
import {
  addCompany,
  allApplications,
  deleteCompany,
  getCompanyData,
  searchCompany,
  updateCompany,
} from "./company.controller.js";
import { referTo, verifyToken } from "../../middleware/verifyToken.js";
import { validate } from "../../middleware/validate.js";
import { addCompanyValidation } from "./company.validation.js";

const companyRouter = Router();
companyRouter.post(
  "/",
  verifyToken,
  referTo("Company_HR"),
  validate(addCompanyValidation),
  addCompany
);
companyRouter.put("/:id", verifyToken, referTo("Company_HR"), updateCompany);
companyRouter.delete("/:id", verifyToken, referTo("Company_HR"), deleteCompany);
companyRouter.get("/:id", verifyToken, referTo("Company_HR"), getCompanyData);
companyRouter.get(
  "/get/search",
  verifyToken,
  referTo("Company_HR", "User"),
  searchCompany
);
companyRouter.get("/job/applications", verifyToken, allApplications);

export default companyRouter;
