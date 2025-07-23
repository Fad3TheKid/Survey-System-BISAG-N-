const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const EmployeeProfile = require('../models/EmployeeProfile');
const Form = require('../models/Form'); // Assuming Form model exists

// Route to get full profile of logged-in employee
router.get('/my-profile', verifyToken, authorizeRoles('employee'), async (req, res) => {
  try {
    const email = req.user.email;
    const profile = await EmployeeProfile.findOne({ email: email }).select('-__v -createdAt -updatedAt');
    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching employee full profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get forms targeted to logged-in employee
router.get('/targeted-forms', verifyToken, authorizeRoles('employee'), async (req, res) => {
  try {
    const email = req.user.email;
    const profile = await EmployeeProfile.findOne({ email: email });
    if (!profile) {
      console.log('Employee profile not found for email:', email);
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    console.log('Employee profile:', profile);

    // Define mapping dictionaries here to avoid ReferenceError
    const departmentMap = {
      'd002': 'D002', // keys normalized to lowercase
      'hr': 'D001',
      'engineering': 'D002',
      'sales': 'D003',
      'marketing': 'D004',
      'gis (geographic information system)': 'D002', // Added mapping for GIS department
    };

    const designationMap = {
      'manager': 'DS001',
      'senior developer': 'DS002',
      'junior developer': 'DS003',
      'intern': 'DS004',
      'satellite communication engineer': 'DS007',
      'gis analyst': 'DS005', // Added mapping for GIS Analyst
    };

    const levelMap = {
      'strategic': 'L001',
      'tactical': 'L002',
      'operational': 'L003',
    };

    // Normalize and map profile fields to codes with trimming
    const departmentKey = profile.department ? profile.department.trim().toLowerCase() : '';
    const designationKey = profile.designation ? profile.designation.trim().toLowerCase() : '';
    const levelKey = profile.level ? profile.level.trim().toLowerCase() : '';

    const departmentCode = (departmentMap[departmentKey] || departmentKey).toLowerCase();
    const designationCode = (designationMap[designationKey] || designationKey).toLowerCase();
    const levelCode = (levelMap[levelKey] || levelKey).toLowerCase();

    console.log(`Mapped codes - Department: ${departmentCode}, Designation: ${designationCode}, Level: ${levelCode}`);

    // Fetch all published forms and filter in code by matching normalized target arrays
    console.log('Fetching all published forms from database...');
    const allForms = await Form.find({ isPublished: true }).select('-__v -createdAt -updatedAt');
    console.log('Total published forms:', allForms.length);

    // If employee level is empty string, return all forms (fallback)
    if (!levelCode) {
      console.log('Employee level is empty, returning all published forms');
      return res.json(allForms);
    }

    const filteredForms = allForms.filter((form) => {
      const normTargetDepartments = (form.targetDepartments || []).map((d) => d.trim().toLowerCase());
      const normTargetDesignations = (form.targetDesignations || []).map((d) => d.trim().toLowerCase());
      const normTargetLevels = (form.targetLevels || []).map((d) => d.trim().toLowerCase());

      console.log(`Checking form ${form._id} with targets: departments=${normTargetDepartments}, designations=${normTargetDesignations}, levels=${normTargetLevels}`);

      // Treat empty employee profile fields as matching all
      const effectiveDepartmentCode = departmentCode || '';
      const effectiveDesignationCode = designationCode || '';
      const effectiveLevelCode = levelCode || '';

      // Allow operation level employees to see all operational targeted surveys regardless of other filters
      const isOperationEmployee = levelCode === 'l003';
      const isOperationalTarget = normTargetLevels.includes('l003');

      const matchLevelAdjusted = isOperationEmployee && isOperationalTarget ? true : (
        normTargetLevels.length === 0 || effectiveLevelCode === '' || normTargetLevels.includes(effectiveLevelCode)
      );

      // Relax department and designation filters for operational level employees targeting operational level
      const matchDepartment = isOperationEmployee && isOperationalTarget
        ? true
        : (normTargetDepartments.length === 0 || effectiveDepartmentCode === '' || normTargetDepartments.includes(effectiveDepartmentCode));

      const matchDesignation = isOperationEmployee && isOperationalTarget
        ? true
        : (normTargetDesignations.length === 0 || effectiveDesignationCode === '' || normTargetDesignations.includes(effectiveDesignationCode));

      console.log(`Match results for form ${form._id}: department=${matchDepartment}, designation=${matchDesignation}, level=${matchLevelAdjusted}`);

    // Revert to AND logic for correct targeting
    const enableTemporaryOverride = false; // Set to false to enforce targeting

    if (enableTemporaryOverride) {
      console.log('Temporary override enabled: returning all published forms');
      return true;
    }

      return matchDepartment && matchDesignation && matchLevelAdjusted;
    });

    console.log('Filtered targeted forms count:', filteredForms.length);

    // Log target fields of each filtered form for debugging
    filteredForms.forEach((form) => {
      console.log(`Form ID: ${form._id}, targetDepartments: ${JSON.stringify(form.targetDepartments)}, targetDesignations: ${JSON.stringify(form.targetDesignations)}, targetLevels: ${JSON.stringify(form.targetLevels)}`);
    });

    res.json(filteredForms);
  } catch (error) {
    console.error('Error fetching targeted forms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get all employees (for admin)
router.get('/employees', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const employees = await EmployeeProfile.find().select('-__v -createdAt -updatedAt');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route without auth middleware to check route accessibility
router.get('/profile-test', (req, res) => {
  res.json({ message: 'Profile test route is accessible' });
});

// New route to register a new employee profile
router.post('/register', async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      dateOfJoining,
      department,
      level,
      designation,
      reportingAuthorityName,
      reportingAuthorityDepartment,
      reportingAuthorityLevel,
      reportingAuthorityDesignation,
      email
    } = req.body;

    // Basic validation
    if (!employeeId || !employeeName) {
      return res.status(400).json({ message: 'Employee ID and Name are required' });
    }

    // Check if employee with same employeeId already exists
    const existingEmployee = await EmployeeProfile.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(409).json({ message: 'Employee with this ID already exists' });
    }

    const newEmployee = new EmployeeProfile({
      employeeId,
      employeeName,
      dateOfJoining,
      department,
      level,
      designation,
      reportingAuthorityName,
      reportingAuthorityDepartment,
      reportingAuthorityLevel,
      reportingAuthorityDesignation,
      email
    });

    await newEmployee.save();

    res.status(201).json({ message: 'Employee registered successfully', employee: newEmployee });
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// New route to fetch raw employee profile and targeted forms for debugging
router.get('/debug-targeted-forms', verifyToken, authorizeRoles('employee'), async (req, res) => {
  try {
    const email = req.user.email;
    const profile = await EmployeeProfile.findOne({ email: email });
    if (!profile) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const allForms = await Form.find({ isPublished: true }).select('-__v -createdAt -updatedAt');

    res.json({
      profile,
      allForms,
    });
  } catch (error) {
    console.error('Error fetching debug targeted forms:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
