const mongoose = require('mongoose');

const PersonalInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'India'
    }
  }
});

const AcademicDetailsSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true
  },
  course: {
    type: String,
    required: [true, 'Course is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  enrollmentDate: {
    type: Date,
    required: [true, 'Enrollment date is required']
  },
  gpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  }
});

const FeeDetailsSchema = new mongoose.Schema({
  totalFees: {
    type: Number,
    required: [true, 'Total fees is required'],
    min: 0
  },
  feesPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  feesPending: {
    type: Number,
    default: function() {
      return this.totalFees - this.feesPaid;
    }
  },
  lastPaymentDate: {
    type: Date
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'online', 'cheque'],
      required: true
    },
    transactionId: {
      type: String
    }
  }]
});

const StudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    type: PersonalInfoSchema,
    required: true
  },
  academicDetails: {
    type: AcademicDetailsSchema,
    required: true
  },
  feeDetails: {
    type: FeeDetailsSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
StudentProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate fees pending before saving
StudentProfileSchema.pre('save', function(next) {
  if (this.feeDetails) {
    this.feeDetails.feesPending = this.feeDetails.totalFees - this.feeDetails.feesPaid;
  }
  next();
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
