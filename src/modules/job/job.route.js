import { Router } from "express";

import { referTo, verifyToken } from "../../middleware/verifyToken.js";
import { upload } from "../../middleware/fileUpload.js";
import {
  addJob,
  allJobs,
  applyJob,
  deleteJob,
  filtersJobs,
  jobsForSpecificCompany,
  updateJob,
} from "./job.controller.js";
import { filters } from "../../middleware/filterForJobs.js";

const jobRouter = Router();
jobRouter.post("/", verifyToken, referTo("Company_HR"), addJob);
jobRouter.put("/:id", verifyToken, referTo("Company_HR"), updateJob);
jobRouter.delete("/:id", verifyToken, referTo("Company_HR"), deleteJob);
jobRouter.get("/", verifyToken, referTo("Company_HR", "User"), allJobs);
jobRouter.get(
  "/company",
  verifyToken,
  referTo("Company_HR", "User"),
  jobsForSpecificCompany
);
jobRouter.get(
  "/filter/search",
  verifyToken,
  referTo("Company_HR", "User"),
  filters,
  filtersJobs
);
jobRouter.post("/applyjob", verifyToken, upload.single("userResume"), applyJob);

export default jobRouter;
