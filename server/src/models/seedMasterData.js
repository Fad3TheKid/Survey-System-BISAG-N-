const mongoose = require('mongoose');
const Master = require('./Master');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formsdb';

const departments = [
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

const levels = [
  { level_id: 'L001', name: 'Strategic' },
  { level_id: 'L002', name: 'Tactical' },
  { level_id: 'L003', name: 'Operational' },
];

// Designations mapped to departments and levels
const designations = [
  // GIS (Geographic Information System)
  { desig_id: 'DS001', name: 'GIS Analyst', dept_id: 'D001', level_id: 'L003' },
  { desig_id: 'DS002', name: 'GIS Engineer', dept_id: 'D001', level_id: 'L003' },
  { desig_id: 'DS003', name: 'GIS Developer', dept_id: 'D001', level_id: 'L003' },
  { desig_id: 'DS004', name: 'Spatial Data Specialist', dept_id: 'D001', level_id: 'L003' },
  { desig_id: 'DS005', name: 'GIS Project Executive', dept_id: 'D001', level_id: 'L003' },
  { desig_id: 'DS006', name: 'GIS Technician', dept_id: 'D001', level_id: 'L003' },

  // Satellite Communication
  { desig_id: 'DS007', name: 'Satellite Communication Engineer', dept_id: 'D002', level_id: 'L001' },
  { desig_id: 'DS008', name: 'RF Engineer', dept_id: 'D002', level_id: 'L001' },
  { desig_id: 'DS009', name: 'Network Operations Executive', dept_id: 'D002', level_id: 'L001' },
  { desig_id: 'DS010', name: 'Satellite Monitoring Officer', dept_id: 'D002', level_id: 'L001' },
  { desig_id: 'DS011', name: 'Communication Systems Analyst', dept_id: 'D002', level_id: 'L001' },

  // Software Development
  { desig_id: 'DS012', name: 'Software Developer', dept_id: 'D003', level_id: 'L001' },
  { desig_id: 'DS013', name: 'Full Stack Developer', dept_id: 'D003', level_id: 'L001' },
  { desig_id: 'DS014', name: 'Backend Developer', dept_id: 'D003', level_id: 'L001' },
  { desig_id: 'DS015', name: 'Frontend Developer', dept_id: 'D003', level_id: 'L001' },
  { desig_id: 'DS016', name: 'Project Leader', dept_id: 'D003', level_id: 'L001' },
  { desig_id: 'DS017', name: 'Software Testing Engineer', dept_id: 'D003', level_id: 'L001' },
  { desig_id: 'DS018', name: 'DevOps Engineer', dept_id: 'D003', level_id: 'L001' },

  // Defence & Strategic Applications
  { desig_id: 'DS019', name: 'Systems Engineer', dept_id: 'D004', level_id: 'L002' },
  { desig_id: 'DS020', name: 'Cybersecurity Analyst', dept_id: 'D004', level_id: 'L002' },
  { desig_id: 'DS021', name: 'Application Developer – Strategic Tools', dept_id: 'D004', level_id: 'L002' },
  { desig_id: 'DS022', name: 'Intelligence Support Executive', dept_id: 'D004', level_id: 'L002' },
  { desig_id: 'DS023', name: 'Defence Software Consultant', dept_id: 'D004', level_id: 'L002' },

  // Remote Sensing & Image Analysis
  { desig_id: 'DS024', name: 'Remote Sensing Analyst', dept_id: 'D005', level_id: 'L003' },
  { desig_id: 'DS025', name: 'Image Processing Engineer', dept_id: 'D005', level_id: 'L003' },
  { desig_id: 'DS026', name: 'Data Interpretation Executive', dept_id: 'D005', level_id: 'L003' },
  { desig_id: 'DS027', name: 'Satellite Imagery Specialist', dept_id: 'D005', level_id: 'L003' },
  { desig_id: 'DS028', name: 'RS-GIS Technician', dept_id: 'D005', level_id: 'L003' },

  // Geo-Informatics
  { desig_id: 'DS029', name: 'Geo-Informatics Engineer', dept_id: 'D006', level_id: 'L002' },
  { desig_id: 'DS030', name: 'Spatial Database Analyst', dept_id: 'D006', level_id: 'L002' },
  { desig_id: 'DS031', name: 'Mapping Executive', dept_id: 'D006', level_id: 'L002' },
  { desig_id: 'DS032', name: 'Cartographic Technician', dept_id: 'D006', level_id: 'L002' },
  { desig_id: 'DS033', name: 'Geospatial Application Developer', dept_id: 'D006', level_id: 'L002' },

  // Environmental Mapping & Modelling
  { desig_id: 'DS034', name: 'Environmental Analyst', dept_id: 'D007', level_id: 'L003' },
  { desig_id: 'DS035', name: 'Modelling Engineer', dept_id: 'D007', level_id: 'L003' },
  { desig_id: 'DS036', name: 'Data Visualization Specialist', dept_id: 'D007', level_id: 'L003' },
  { desig_id: 'DS037', name: 'Remote Environmental Monitor', dept_id: 'D007', level_id: 'L003' },
  { desig_id: 'DS038', name: 'Climate Data Technician', dept_id: 'D007', level_id: 'L003' },

  // E-Governance Applications
  { desig_id: 'DS039', name: 'E-Governance Software Developer', dept_id: 'D008', level_id: 'L001' },
  { desig_id: 'DS040', name: 'Application Support Executive', dept_id: 'D008', level_id: 'L001' },
  { desig_id: 'DS041', name: 'UI/UX Designer', dept_id: 'D008', level_id: 'L001' },
  { desig_id: 'DS042', name: 'Systems Integration Executive', dept_id: 'D008', level_id: 'L001' },
  { desig_id: 'DS043', name: 'Government IT Consultant', dept_id: 'D008', level_id: 'L001' },

  // AI & Data Analytics
  { desig_id: 'DS044', name: 'Data Scientist', dept_id: 'D009', level_id: 'L001' },
  { desig_id: 'DS045', name: 'AI Developer', dept_id: 'D009', level_id: 'L001' },
  { desig_id: 'DS046', name: 'Machine Learning Engineer', dept_id: 'D009', level_id: 'L001' },
  { desig_id: 'DS047', name: 'Data Analyst', dept_id: 'D009', level_id: 'L001' },
  { desig_id: 'DS048', name: 'NLP Engineer', dept_id: 'D009', level_id: 'L001' },
  { desig_id: 'DS049', name: 'Deep Learning Engineer', dept_id: 'D009', level_id: 'L001' },

  // Web & Mobile Application Development
  { desig_id: 'DS050', name: 'Web Developer', dept_id: 'D010', level_id: 'L002' },
  { desig_id: 'DS051', name: 'Mobile App Developer (Android/iOS)', dept_id: 'D010', level_id: 'L002' },
  { desig_id: 'DS052', name: 'UI/UX Designer', dept_id: 'D010', level_id: 'L002' },
  { desig_id: 'DS053', name: 'React Developer', dept_id: 'D010', level_id: 'L002' },
  { desig_id: 'DS054', name: 'Flutter Developer', dept_id: 'D010', level_id: 'L002' },
  { desig_id: 'DS055', name: 'App Tester', dept_id: 'D010', level_id: 'L002' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB with URI:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    console.log('Deleting existing Master documents...');
    const deleteResult = await Master.deleteMany({});
    console.log('Deleted documents count:', deleteResult.deletedCount);

    console.log('Inserting new Master document...');
    const master = new Master({ departments, levels, designations });
    const savedDoc = await master.save();
    console.log('Inserted Master document:', savedDoc);

    console.log('Master data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding master data:', error);
    process.exit(1);
  }
}

seed();
