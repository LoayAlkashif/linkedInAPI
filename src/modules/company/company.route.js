import { Router } from "express";
import {
  addCompany,
  allApplications,
  deleteCompany,
  getCompanyData,
  searchCompany,
  updateCompany,
} from "./company.controller.js";
import { allowedTo, verifyToken } from "../../middleware/verifyToken.js";
import { validate } from "../../middleware/validate.js";
import { addCompanyValidation } from "./company.validation.js";

const companyRouter = Router();
companyRouter.post(
  "/addCompany",
  verifyToken,
  allowedTo("Company_HR"),
  validate(addCompanyValidation),
  addCompany
);
companyRouter.patch("/updateCompany/:id", verifyToken, allowedTo("Company_HR"), updateCompany);
companyRouter.delete("/deleteCompany/:id", verifyToken, allowedTo("Company_HR"), deleteCompany);
companyRouter.get("/:id", verifyToken, allowedTo("User","Company_HR"), getCompanyData);
companyRouter.get(
  "/get/search",
  verifyToken,
  allowedTo("Company_HR", "User"),
  searchCompany
);
companyRouter.get("/job/applications", verifyToken, allApplications);

export default companyRouter;
