const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');

// Sample data for seeding
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john.doe@university.edu',
    password: 'student123',
    role: 'student'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    password: 'student123',
    role: 'student'
  }
];

const sampleProfiles = [
  {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2000-05-15',
      gender: 'male',
      phone: '9876543210',
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India'
      }
    },
    academicDetails: {
      studentId: 'CS2021001',
      course: 'Computer Science',
      department: 'Computer Science & Engineering',
      year: 3,
      semester: 5,
      enrollmentDate: '2021-08-01',
      gpa: 8.5
    },
    feeDetails: {
      totalFees: 150000,
      feesPaid: 100000,
      paymentHistory: [
        {
          amount: 50000,
          date: '2021-08-15',
          method: 'online',
          transactionId: 'TXN123456'
        },
        {
          amount: 50000,
          date: '2022-08-15',
          method: 'card',
          transactionId: 'TXN789012'
        }
      ]
    }
  },
  {
    personalInfo: {
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '2001-03-20',
      gender: 'female',
      phone: '9876543211',
      address: {
        street: '456 Park Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India'
      }
    },
    academicDetails: {
      studentId: 'EE2021002',
      course: 'Electronics Engineering',
      department: 'Electronics & Communication',
      year: 2,
      semester: 4,
      enrollmentDate: '2021-08-01',
      gpa: 9.0
    },
    feeDetails: {
      totalFees: 140000,
      feesPaid: 70000,
      paymentHistory: [
        {
          amount: 35000,
          date: '2021-08-15',
          method: 'cash',
          transactionId: 'TXN345678'
        },
        {
          amount: 35000,
          date: '2022-08-15',
          method: 'online',
          transactionId: 'TXN901234'
        }
      ]
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management');
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create student profiles
    for (let i = 0; i < sampleProfiles.length; i++) {
      const profileData = sampleProfiles[i];
      const studentUser = createdUsers[i + 1]; // Skip admin user
      
      if (studentUser && studentUser.role === 'student') {
        profileData.userId = studentUser._id;
        const profile = new StudentProfile(profileData);
        await profile.save();
        
        // Update user profile completion status
        await User.findByIdAndUpdate(studentUser._id, { profileCompleted: true });
        
        console.log(`Created profile for student: ${studentUser.email}`);
      }
    }

    console.log('Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@university.edu / admin123');
    console.log('Student 1: john.doe@university.edu / student123');
    console.log('Student 2: jane.smith@university.edu / student123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase();
