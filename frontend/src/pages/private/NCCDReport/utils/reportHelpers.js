/**
 * Gets the appropriate chip color based on report status
 * @param {string} status - The report status
 * @returns {string} The chip color
 */
export const getStatusChipColor = (status) => {
  switch (status) {
    case "NotStart":
      return "default";
    case "InProgress":
      return "primary";
    case "Approved":
      return "success";
    default:
      return "default";
  }
};

/**
 * Gets a human-readable status label
 * @param {string} status - The report status
 * @returns {string} The readable status label
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case "NotStart":
      return "Not Started";
    case "InProgress":
      return "In Progress";
    case "Approved":
      return "Approved";
    default:
      return status;
  }
};

/**
 * Gets a human-readable disability category label
 * @param {string} category - The disability category
 * @returns {string} The readable category label
 */
export const getDisabilityCategoryLabel = (category) => {
  if (!category || category === "None") return "None";
  return category;
};

/**
 * Gets a human-readable adjustment level label
 * @param {string} level - The adjustment level
 * @returns {string} The readable adjustment label
 */
export const getAdjustmentLabel = (level) => {
  switch (level) {
    case "QDTP":
      return "Quality Differentiated Teaching Practice";
    case "Supplementary":
      return "Supplementary adjustments";
    case "Substantial":
      return "Substantial adjustments";
    case "Extensive":
      return "Extensive adjustments";
    case "None":
    default:
      return level || "None";
  }
};

/**
 * Filters reports based on filter criteria
 * @param {Array} reports - Array of reports to filter
 * @param {Array} students - Array of students
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered reports array
 */
export const filterReports = (reports, students, { statusFilter, studentFilter, nameSearch }) => {
  return reports.filter((report) => {
    // Find student for this report
    const student = students.find((s) => s.id === report.student);
    if (!student) return false;

    // Apply status filter
    if (statusFilter && report.status !== statusFilter) {
      return false;
    }

    // Apply student filter
    if (studentFilter && report.student !== parseInt(studentFilter)) {
      return false;
    }

    // Apply name search
    if (nameSearch) {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      if (!fullName.includes(nameSearch.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}; 