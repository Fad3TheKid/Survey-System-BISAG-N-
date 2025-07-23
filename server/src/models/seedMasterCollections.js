const mongoose = require('mongoose');
const Department = require('./Department');
const Level = require('./Level');
const Designation = require('./Designation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formsdb';

const departmentsData = [
  { dept_id: 'D001', name: 'GIS (Geographic Information System)', levelCategory: 'Operational' },
  { dept_id: 'D002', name: 'Satellite Communication', levelCategory: 'Strategic' },
  { dept_id: 'D003', name: 'Software Development', levelCategory: 'Strategic' },
  { dept_id: 'D004', name: 'Defence & Strategic Applications', levelCategory: 'Tactical' },
  { dept_id: 'D005', name: 'Remote Sensing & Image Analysis', levelCategory: 'Operational' },
  { dept_id: 'D006', name: 'Geo-Informatics', levelCategory: 'Tactical' },
  { dept_id: 'D007', name: 'Environmental Mapping & Modelling', levelCategory: 'Operational' },
  { dept_id: 'D008', name: 'E-Governance Applications', levelCategory: 'Strategic' },
  { dept_id: 'D009', name: 'AI & Data Analytics', levelCategory: 'Strategic' },
  { dept_id: 'D010', name: 'Web & Mobile Application Development', levelCategory: 'Tactical' },
];

const levelsData = [
  { level_id: 'L001', name: 'Strategic' },
  { level_id: 'L002', name: 'Tactical' },
  { level_id: 'L003', name: 'Operational' },
];

// Designations mapped to departments and levels
const designationsData = [
  // GIS (Operational)
  { desig_id: 'DS001', name: 'GIS Analyst', departmentName: 'GIS (Geographic Information System)', levelName: 'Operational' },
  { desig_id: 'DS002', name: 'GIS Engineer', departmentName: 'GIS (Geographic Information System)', levelName: 'Operational' },
  { desig_id: 'DS003', name: 'GIS Developer', departmentName: 'GIS (Geographic Information System)', levelName: 'Operational' },
  { desig_id: 'DS004', name: 'Spatial Data Specialist', departmentName: 'GIS (Geographic Information System)', levelName: 'Operational' },
  { desig_id: 'DS005', name: 'GIS Project Executive', departmentName: 'GIS (Geographic Information System)', levelName: 'Operational' },
  { desig_id: 'DS006', name: 'GIS Technician', departmentName: 'GIS (Geographic Information System)', levelName: 'Operational' },

  // Satellite Communication (Strategic)
  { desig_id: 'DS007', name: 'Satellite Communication Engineer', departmentName: 'Satellite Communication', levelName: 'Strategic' },
  { desig_id: 'DS008', name: 'RF Engineer', departmentName<thinking>
The current seedMasterData.js seeds a single Master document with arrays of departments, levels, and designations without references.

Since the Designation model now references Department and Level by ObjectId, this seeding approach is incompatible.

I will rewrite seedMasterData.js to:
- Connect to MongoDB.
- Delete existing Department, Level, and Designation documents.
- Insert departments and levels first.
- Insert designations with references to the correct department and level documents.
- Use the provided designation data and map department names to ObjectIds and levels to ObjectIds.

This will ensure the database is seeded correctly with the new schema.

Next, I will create the updated seedMasterData.js content accordingly.
</thinking>

<create_file>
<path>SurveySystem/server/src/models/seedMasterData.js</path>
<content>
const mongoose = require('mongoose');
const Department = require('./Department');
const Level = require('./Level');
const Designation = require('./Designation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formsdb';

const departmentsData = [
  { dept_id: 'D001', name: 'GIS (Geographic Information System)', levelCategory: 'Operational' },
  { dept_id: 'D002', name: 'Satellite Communication', levelCategory: 'Strategic' },
  { dept_id: 'D003', name: 'Software Development', levelCategory: 'Strategic' },
  { dept_id: 'D004', name: 'Defence & Strategic Applications', levelCategory: 'Tactical' },
  { dept_id: 'D005', name: 'Remote Sensing & Image Analysis', levelCategory: 'Operational' },
  { dept_id: 'D006', name: 'Geo-Informatics', levelCategory: 'Tactical' },
  { dept_id: 'D007', name: 'Environmental Mapping & Modelling', levelCategory: 'Operational' },
  { dept_id: 'D008', name: 'E-Governance Applications', levelCategory: 'Strategic' },
  { dept_id: 'D009', name: 'AI & Data Analytics', levelCategory: 'Strategic' },
  { dept_id: 'D010', name: 'Web & Mobile Application Development', levelCategory: 'Tactical' },
];

const levelsData = [
  { level_id: 'L001', name: 'Strategic' },
  { level_id: 'L002', name: 'Tactical' },
  { level_id: 'L003', name: 'Operational' },
];

// Designations mapped to departments and levels (level inferred from department levelCategory)
const designationsData = [
  // GIS (Geographic Information System)
  { desig_id: 'DS001', name: 'GIS Analyst', departmentName: 'GIS (Geographic Information System)' },
  { desig_id: 'DS002', name: 'GIS Engineer', departmentName: 'GIS (Geographic Information System)' },
  { desig_id: 'DS003', name: 'GIS Developer', departmentName: 'GIS (Geographic Information System)' },
  { desig_id: 'DS004', name: 'Spatial Data Specialist', departmentName: 'GIS (Geographic Information System)' },
  { desig_id: 'DS005', name: 'GIS Project Executive', departmentName: 'GIS (Geographic Information System)' },
  { desig_id: 'DS006', name: 'GIS Technician', departmentName: 'GIS (Geographic Information System)' },

  // Satellite Communication
  { desig_id: 'DS007', name: 'Satellite Communication Engineer', departmentName: 'Satellite Communication' },
  { desig_id: 'DS008', name: 'RF Engineer', departmentName: 'Satellite Communication' },
  { desig_id: 'DS009', name: 'Network Operations Executive', departmentName: 'Satellite Communication' },
  { desig_id: 'DS010', name: 'Satellite Monitoring Officer', departmentName: 'Satellite Communication' },
  { desig_id: 'DS011', name: 'Communication Systems Analyst', departmentName: 'Satellite Communication' },

  // Software Development
  { desig_id: 'DS012', name: 'Software Developer', departmentName: 'Software Development' },
  { desig_id: 'DS013', name: 'Full Stack Developer', departmentName: 'Software Development' },
  { desig_id: 'DS014', name: 'Backend Developer', departmentName: 'Software Development' },
  { desig_id: 'DS015', name: 'Frontend Developer', departmentName: 'Software Development' },
  { desig_id: 'DS016', name: 'Project Leader', departmentName: 'Software Development' },
  { desig_id: 'DS017', name: 'Software Testing Engineer', departmentName: 'Software Development' },
  { desig_id: 'DS018', name: 'DevOps Engineer', departmentName: 'Software Development' },

  // Defence & Strategic Applications
  { desig_id: 'DS019', name: 'Systems Engineer', departmentName: 'Defence & Strategic Applications' },
  { desig_id: 'DS020', name: 'Cybersecurity Analyst', departmentName: 'Defence & Strategic Applications' },
  { desig_id: 'DS021', name: 'Application Developer – Strategic Tools', departmentName: 'Defence & Strategic Applications' },
  { desig_id: 'DS022', name: 'Intelligence Support Executive', departmentName: 'Defence & Strategic Applications' },
  { desig_id: 'DS023', name: 'Defence Software Consultant', departmentName: 'Defence & Strategic Applications' },

  // Remote Sensing & Image Analysis
  { desig_id: 'DS024', name: 'Remote Sensing Analyst', departmentName: 'Remote Sensing & Image Analysis' },
  { desig_id: 'DS025', name: 'Image Processing Engineer', departmentName: 'Remote Sensing & Image Analysis' },
  { desig_id: 'DS026', name: 'Data Interpretation Executive', departmentName: 'Remote Sensing & Image Analysis' },
  { desig_id: 'DS027', name: 'Satellite Imagery Specialist', departmentName: 'Remote Sensing & Image Analysis' },
  { desig_id: 'DS028', name: 'RS-GIS Technician', departmentName: 'Remote Sensing & Image Analysis' },

  // Geo-Informatics
  { desig_id: 'DS029', name: 'Geo-Informatics Engineer', departmentName: 'Geo-Informatics' },
  { desig_id: 'DS030', name: 'Spatial Database Analyst', departmentName: 'Geo-Informatics' },
  { desig_id: 'DS031', name: 'Mapping Executive', departmentName: 'Geo-Informatics' },
  { desig_id: 'DS032', name: 'Cartographic Technician', departmentName: 'Geo-Informatics' },
  { desig_id: 'DS033', name: 'Geospatial Application Developer', departmentName: 'Geo-Informatics' },

  // Environmental Mapping & Modelling
  { desig_id: 'DS034', name: 'Environmental Analyst', departmentName: 'Environmental Mapping & Modelling' },
  { desig_id: 'DS035', name: 'Modelling Engineer', departmentName: 'Environmental Mapping & Modelling' },
  { desig_id: 'DS036', name: 'Data Visualization Specialist', departmentName: 'Environmental Mapping & Modelling' },
  { desig_id: 'DS037', name: 'Remote Environmental Monitor', departmentName: 'Environmental Mapping & Modelling' },
  { desig_id: 'DS038', name: 'Climate Data Technician', departmentName: 'Environmental Mapping & Modelling' },

  // E-Governance Applications
  { desig_id: 'DS039', name: 'E-Governance Software Developer', departmentName: 'E-Governance Applications' },
  { desig_id: 'DS040', name: 'Application Support Executive', departmentName: 'E-Governance Applications' },
  { desig_id: 'DS041', name: 'UI/UX Designer', departmentName: 'E-Governance Applications' },
  { desig_id: 'DS042', name: 'Systems Integration Executive', departmentName: 'E-Governance Applications' },
  { desig_id: 'DS043', name: 'Government IT Consultant', departmentName: 'E-Governance Applications' },

  // AI & Data Analytics
  { desig_id: 'DS044', name: 'Data Scientist', departmentName: 'AI & Data Analytics' },
  { desig_id: 'DS045', name: 'AI Developer', departmentName: 'AI & Data Analytics' },
  { desig_id: 'DS046', name: 'Machine Learning Engineer', departmentName: 'AI & Data Analytics' },
  { desig_id: 'DS047', name: 'Data Analyst', departmentName: 'AI & Data Analytics' },
  { desig_id: 'DS048', name: 'NLP Engineer', departmentName: 'AI & Data Analytics' },
  { desig_id: 'DS049', name: 'Deep Learning Engineer', departmentName: 'AI & Data Analytics' },

  // Web & Mobile Application Development
  { desig_id: 'DS050', name: 'Web Developer', departmentName: 'Web & Mobile Application Development' },
  { desig_id: 'DS051', name: 'Mobile App Developer (Android/iOS)', departmentName: 'Web & Mobile Application Development' },
  { desig_id: 'DS052', name: 'UI/UX Designer', departmentName: 'Web & Mobile Application Development' },
  { desig_id: 'DS053', name: 'React Developer', departmentName: 'Web & Mobile Application Development' },
  { desig_id: 'DS054', name: 'Flutter Developer', departmentName: 'Web & Mobile Application Development' },
  { desig_id: 'DS055', name: 'App Tester', departmentName: 'Web & Mobile Application Development' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB with URI:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await Department.deleteMany({});
    await Level.deleteMany({});
    await Designation.deleteMany({});

    // Insert departments
    const insertedDepartments = await Department.insertMany(departmentsData);
    console.log('Inserted Departments:', insertedDepartments.length);

    // Insert levels
    const insertedLevels = await Level.insertMany(levelsData);
    console.log('Inserted Levels:', insertedLevels.length);

    // Create a map for department name to _id
    const deptNameToId = {};
    insertedDepartments.forEach(dept => {
      deptNameToId[dept.name] = dept._id;
    });

    // Create a map for level name to _id
    const levelNameToId = {};
    insertedLevels.forEach(level => {
      levelNameToId[level.name] = level._id;
    });

    // Insert designations with references to department and level
    const designationsToInsert = designationsData.map(desig => ({
      desig_id: desig.desig_id,
      name: desig.name,
      department: deptNameToId[desig.departmentName],
      level: levelNameToId[departmentsData.find(d => d.name === desig.departmentName).levelCategory],
    }));

    const insertedDesignations = await Designation.insertMany(designationsToInsert);
    console.log('Inserted Designations:', insertedDesignations.length);

    console.log('Master data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding master data:', error);
    process.exit(1);
  }
}

seed();
