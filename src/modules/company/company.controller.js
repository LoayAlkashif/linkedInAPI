import { Application } from "../../../database/models/application.model.js";
import { Company } from "../../../database/models/company.model.js";
import { Job } from "../../../database/models/job.model.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";

// add company
const addCompany = catchError(async (req, res, next) => {
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR,
  } = req.body;
  const comapnyExist = await Company.findOne({ companyName });
  if (comapnyExist) return next(new AppError("Company is already Exist", 409));

  const newCompany = new Company({
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR,
  });
  await newCompany.save();
  res.status(201).json({ message: "Added Company", newCompany });
});

// update ccompany by user his role is Company_HR
const updateCompany = catchError(async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  if (!company) return next(new AppError("Company not found", 404));

  if (company.companyHR.toString() !== req.user.userId.toString()) {
    return next(new AppError("You do not have permission to update", 401));
  }

  Object.assign(company, req.body);
  await company.save();
  res.status(200).json({ message: "Company updated successfully", company });
});

// delete company by user his role is Company_HR
const deleteCompany = catchError(async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  if (!company) return next(new AppError("Company not found", 404));
  // check user his role is company
  if (company.companyHR.toString() !== req.user.userId.toString()) {
    return next(new AppError("You do not have permission to update", 401));
  }

  await Company.findByIdAndDelete(company);
  res.status(200).json({ message: "Company Deleted" });
});

//get company data
const getCompanyData = catchError(async (req, res, next) => {
  const company = await Company.findById(req.params.id).populate(
    "companyHR",
    "-password -recoveryEmail -otp -otpExpire -otpVerified -createdAt"
  );
  if (!company) return next(new AppError("Company not found", 404));

  res.status(200).json({ company });
});
// search company
const searchCompany = catchError(async (req, res, next) => {
  const { companyName } = req.query;

  if (!companyName) return next(new AppError("Company not found", 401));
  const company = await Company.findOne({ companyName });
  res.status(200).json({ message: "Founded", company });
});

//Get all applications for specific Jobs
const allApplications = catchError(async (req, res, next) => {
  const companyHRId = req.user.userId;
  const company = await Company.findOne({ companyHR: companyHRId });

  const jobs = await Job.find({ addedBy: company._id });
  if (jobs.length == 0)
    return next(new AppError("No jobs related to this company HR", 404));
  const jobIds = jobs.map((job) => job._id);

  const applications = await Application.find({
    jobId: { $in: jobIds },
  }).populate("user", "username email mobileNumber DOB");
  res.status(200).json({ message: "success", applications });
});
export {
  addCompany,
  updateCompany,
  deleteCompany,
  getCompanyData,
  searchCompany,
  allApplications,
};
