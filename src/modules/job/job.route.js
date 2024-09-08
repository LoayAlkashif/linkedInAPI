import { Router } from "express";
import { uploadFile, filteration } from "../../middleware/fileUpload.js";
import { allowedTo, verifyToken } from "../../middleware/verifyToken.js";
import * as JC from "./job.controller.js";
import { filters } from "../../middleware/filterForJobs.js";

const jobRouter = Router();
jobRouter.post("/addJob", verifyToken, allowedTo("Company_HR"), JC.addJob);
jobRouter.put("/:id", verifyToken, allowedTo("Company_HR"), JC.updateJob);
jobRouter.delete("/:id", verifyToken, allowedTo("Company_HR"), JC.deleteJob);
jobRouter.get("/", verifyToken, allowedTo("Company_HR", "User"), JC.allJobs);
jobRouter.get(
  "/company",
  verifyToken,
  allowedTo("Company_HR", "User"),
  JC.jobsForSpecificCompany
);
jobRouter.get(
  "/filter/search",
  verifyToken,
  allowedTo("Company_HR", "User"),
  filters,
  JC.filtersJobs
);
jobRouter.post(
  "/applyjob",
  verifyToken,
  allowedTo("User"),
  uploadFile(filteration.file).single("pdf"),
  JC.applyJob
);


jobRouter.get(
  "/excelsheet/:companyId",
  verifyToken,
  allowedTo("Company_HR","User"),
  JC.excelSheet
);
export default jobRouter;
