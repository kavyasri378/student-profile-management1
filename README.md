# Student Profile Management System

A complete MERN stack application for managing student profiles with role-based access control.

## 🚀 Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **Role-based Access**: Student & Admin/Staff

## 📋 Features

### Authentication System
- User registration with role selection (Student/Admin)
- Secure login with JWT
- Password hashing with bcrypt
- Protected routes with middleware
- Role-based redirection

### Student Features
- Profile completion after registration
- View-only dashboard
- Personal information display
- Academic details view
- Fee status tracking

### Admin Features
- Complete CRUD operations on student profiles
- Search and filter functionality
- Dashboard statistics
- Student management interface

## 📁 Project Structure

```
SPM/
├── backend/
│   ├── controllers/
│   ├── models/
│   │   ├── User.js
│   │   └── StudentProfile.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── profile.js
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ProfileForm.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── EditStudent.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── README.md
└── .gitignore
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/student-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   ```

4. Start the server:
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

### Database Seeding (Optional)
To populate the database with sample data:

1. Make sure your MongoDB server is running
2. From the backend directory, run:
   ```bash
   node seed.js
   ```

This will create:
- Admin user: `admin@university.edu` / `admin123`
- Student user: `john.doe@university.edu` / `student123`
- Student user: `jane.smith@university.edu` / `student123`

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

## 📚 API Documentation

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile-completed` - Mark profile as completed

### Student Profile Routes
- `POST /api/profile` - Create student profile (Student only)
- `GET /api/profile/me` - Get own profile (Student only)
- `GET /api/profile/all` - Get all students (Admin only)
- `GET /api/profile/:id` - Get single student (Admin only)
- `PUT /api/profile/:id` - Update student profile (Admin only)
- `DELETE /api/profile/:id` - Delete student profile (Admin only)
- `GET /api/profile/stats/dashboard` - Get dashboard statistics (Admin only)

### Query Parameters for Student List
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name, email, or student ID
- `course` - Filter by course
- `year` - Filter by year

## 🎯 Usage

### For Students
1. Register with your email and password
2. Complete your profile with personal, academic, and fee details
3. View your dashboard with all your information
4. Track your fee status and payment history

### For Admins
1. Register as admin or use seeded admin credentials
2. Access the admin dashboard
3. View all student profiles with search and filtering
4. Edit or delete student records
5. View dashboard statistics and analytics

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Role-based Navigation**: Different menus for students and admins
- **Interactive Dashboard**: Real-time statistics and data visualization
- **Form Validation**: Client-side and server-side validation
- **Toast Notifications**: User-friendly feedback messages
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/admin),
  profileCompleted: Boolean,
  createdAt: Date
}
```

### Student Profile Model
```javascript
{
  userId: ObjectId (ref: User),
  personalInfo: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  academicDetails: {
    studentId: String (unique),
    course: String,
    department: String,
    year: Number,
    semester: Number,
    enrollmentDate: Date,
    gpa: Number
  },
  feeDetails: {
    totalFees: Number,
    feesPaid: Number,
    feesPending: Number,
    paymentHistory: [{
      amount: Number,
      date: Date,
      method: String,
      transactionId: String
    }]
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Build and deploy the Node.js application
3. Ensure MongoDB is accessible (MongoDB Atlas recommended)

### Frontend Deployment
1. Build the React application:
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to your hosting platform
3. Configure environment variables if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file
   - Verify network connectivity

2. **JWT Token Issues**
   - Check JWT_SECRET in your .env file
   - Ensure token is not expired
   - Verify Authorization header format

3. **CORS Issues**
   - Check frontend proxy configuration
   - Verify CORS settings in backend

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Getting Help

If you encounter any issues, please:
1. Check the console for error messages
2. Review the troubleshooting section above
3. Create an issue with detailed information
4. Include steps to reproduce the problem

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.
