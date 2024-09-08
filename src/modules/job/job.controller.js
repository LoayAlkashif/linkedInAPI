import { Application } from "../../../database/models/application.model.js";
import { Company } from "../../../database/models/company.model.js";
import { Job } from "../../../database/models/job.model.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";
import cloudinary from "../../utils/cloudinary.js";
import ExcelJs from "exceljs"

// add job
const addJob = catchError(async (req, res, next) => {
  let existCompany = await Company.findOne({companyHR: req.user.userId})

  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
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
    company: existCompany._id
  });
  const job = await newJob.save();
  res.status(201).json({ message: "Added Job", job });
});

// update job by added by his role is Company_HR
const updateJob = catchError(async (req, res, next) => {
  const job = await Job.findOne({_id:req.params.id});
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
    .populate("company", "-companyEmail -companyHR -createdAt -_id")
    .populate(
      "addedBy",
      "username -_id"
    );
  res.status(200).json({ message: "Success", jobs });
});

// get all jobs for specific company
const jobsForSpecificCompany = catchError(async (req, res, next) => {
  const { companyName } = req.query;
  const company = await Company.findOne({ companyName });
  if (!company) return next(new AppError("Company not found", 404));

  const jobs = await Job.find({ addedBy: company.companyHR })
    .populate("company", "-companyEmail -companyHR -createdAt -_id")
    .populate(
      "addedBy",
      "username -_id"
    );
  res.status(200).json({ message: "Success", jobs });
});

// Get all Jobs that match the following filters
const filtersJobs = catchError(async (req, res, next) => {
  const query = req.queryObject; // Get the query object from the middleware
  const jobs = await Job.find(query)
    .populate("company", "-companyEmail -companyHR -createdAt -_id")
    .populate(
      "addedBy",
      "username -_id"
    );
  res.status(200).json({ jobs });
});

// apply to job
const applyJob = catchError(async (req, res, next) => {
  const {userTechSkills, userSoftSkills, jobId} = req.body

  const userId = req.user.userId
  const job = await Job.find({jobId});
   if (!job) return next(new AppError("Job not found", 404));

   const isExist = await Application.findOne({userId, jobId})
  if(isExist) {
    return res.status(409).json({message: "you already applied"})
  }

  const {secure_url, public_id} = await cloudinary.uploader.upload(req.file.path,{
    folder: "exam2/userResumes"
  })

  const application = await Application.create({userSoftSkills, userTechSkills, 
    userResume:{secure_url, public_id}, userId, jobId})

    return res.status(201).json({message: "Suceess", application})
});


const excelSheet = catchError(async(req,res,next) => {
  const company = await Company.findById(req.params.companyId)
  const jobs = await Job.find({addedBy: company.companyHR})

  var applications = []
  for(let job of jobs) {
    var application = await Application.find({jobId: job._id}).populate("userId jobId")
    applications.push(application)
  }

  const workbook =  new ExcelJs.Workbook()
  const workSheet = workbook.addWorksheet("bonus sheet")

  workSheet.columns = [
    {header: "user name", key:"user", width:20},
    {header: "resume link", key:"resume", width:100},
    {header: "job applied to", key:"job", width:20},

  ]

  var data = []
  for(const inApplication of applications){
    for(const application of inApplication) {
      var dataEntry = {user: application.userId.username, resume: application.userResume.secure_url, job:application.jobId.jobTitle}
      data.push(dataEntry)
    }
  }
  workSheet.addRows(data)

  await workbook.xlsx.writeFile("bonus.xlsx").catch(error =>  console.log(error)  )
  
  return res.json({applications})
})

export {
  addJob,
  updateJob,
  deleteJob,
  allJobs,
  jobsForSpecificCompany,
  filtersJobs,
  applyJob,
  excelSheet,
};
