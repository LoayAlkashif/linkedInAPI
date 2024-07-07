import { Application } from "../../../database/models/application.model.js";
import { Company } from "../../../database/models/company.model.js";
import { Job } from "../../../database/models/job.model.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";

// add job
const addJob = catchError(async (req, res, next) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy,
  } = req.body;

  const newJob = new Job({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: req.user.userId,
  });
  const job = await newJob.save();
  res.status(201).json({ message: "Added Job", job });
});

// update job by added by his role is Company_HR
const updateJob = catchError(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError("Job not found", 404));

  if (job.addedBy.toString() !== req.user.userId.toString()) {
    return next(new AppError("You do not have permission to update", 401));
  }

  Object.assign(job, req.body);
  await job.save();
  res.status(200).json({ message: "Job updated successfully", job });
});

// delete job by added by his role is Company_HR
const deleteJob = catchError(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError("Job not found", 404));
  // check user his role is company
  if (job.addedBy.toString() !== req.user.userId.toString()) {
    return next(new AppError("You do not have permission to delete", 401));
  }

  await Job.findByIdAndDelete(job);
  res.status(200).json({ message: "Job Deleted" });
});

//get all job for both roles
const allJobs = catchError(async (req, res, next) => {
  const jobs = await Job.find()
    .populate("company")
    .populate(
      "addedBy",
      "-password -recoveryEmail -otp -otpExpire -otpVerified -createdAt"
    );
  res.status(200).json({ message: "Success", jobs });
});

// get all jobs for specific company
const jobsForSpecificCompany = catchError(async (req, res, next) => {
  const { companyName } = req.query;
  const company = await Company.findOne({ companyName });
  if (!company) return next(new AppError("Company not found", 404));

  const jobs = await Job.find({ addedBy: company.companyHR })
    .populate("company")
    .populate(
      "addedBy",
      "-password -recoveryEmail -otp -otpExpire -otpVerified -createdAt"
    );
  res.status(200).json({ message: "Success", jobs });
});

// Get all Jobs that match the following filters
const filtersJobs = catchError(async (req, res, next) => {
  const query = req.queryObject; // Get the query object from the middleware
  const jobs = await Job.find(query)
    .populate("company")
    .populate(
      "addedBy",
      "-password -recoveryEmail -otp -otpExpire -otpVerified -createdAt"
    );
  res.status(200).json({ jobs });
});

// apply to job
const applyJob = catchError(async (req, res, next) => {
  if (req.user.role !== "User")
    return next(new AppError("your role must be User", 401));
  const job = await Job.findById(req.body.jobId);
  if (!job) return next(new AppError("Job not found", 404));

  req.body.userResume = req.file.filename;
  const application = await Application.insertMany({
    ...req.body,
    user: req.logedUser.userId,
  });
  res.status(200).json({ message: "success", application });
});

export {
  addJob,
  updateJob,
  deleteJob,
  allJobs,
  jobsForSpecificCompany,
  filtersJobs,
  applyJob,
};
