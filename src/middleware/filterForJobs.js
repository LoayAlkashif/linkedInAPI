export const filters = (req, res, next) => {
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query;
  const query = {};

  if (workingTime) {
    query.workingTime = workingTime;
  }
  if (jobLocation) {
    query.jobLocation = jobLocation;
  }
  if (seniorityLevel) {
    query.seniorityLevel = seniorityLevel;
  }
  if (jobTitle) {
    query.jobTitle = new RegExp(jobTitle, "i");
  }
  if (technicalSkills) {
    query.technicalSkills = { $all: technicalSkills.split(",") };
  }

  req.queryObject = query;
  next();
};
