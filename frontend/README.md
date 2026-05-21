# 🏠 RealEstate Platform

This project is a modern Full Stack Real Estate Web Application developed using the MERN Stack, including MongoDB, Express.js, React.js, and Node.js. The platform allows users to browse, search, wishlist, and communicate about properties through a responsive and user friendly interface. The application is designed to provide a complete real estate management experience by combining modern web technologies, cloud services, secure authentication systems, and real time communication features.

The frontend of the application is built using React.js and Vite, delivering fast performance, smooth navigation, and dynamic rendering across desktop, tablet, and mobile devices. Users can explore featured property listings, view complete property details, search properties using filters, and save favorite properties through the wishlist functionality. The user interface is designed with responsiveness and simplicity to improve usability and user engagement.

The backend is developed using Node.js and Express.js with RESTful APIs to ensure efficient communication between the frontend and backend systems. MongoDB Atlas is used as the cloud database for storing user details, property information, wishlist records, and chat data. JWT authentication and bcrypt.js are implemented for secure login, password encryption, authorization handling, and protected routes.

The project also integrates Cloudinary for secure image upload, cloud storage management, and optimized image delivery. Real time chat functionality is implemented using Socket.IO, enabling instant communication between users regarding property inquiries and discussions. Additional technologies used include Axios for API handling, React Router DOM for navigation, GitHub for version control, and modern development tools for testing and deployment.

Overall, this project demonstrates strong practical knowledge of full stack development, API integration, cloud services, authentication systems, responsive UI design, database management, and real time communication. It reflects the ability to build scalable, secure, and production ready MERN stack applications using modern web development technologies and industry standard practices.

The application also includes property management features such as adding, editing, and deleting property listings with image support. The architecture is organized for scalability and maintainability, allowing smooth integration of future enhancements and advanced functionalities. This project highlights problem solving skills, backend optimization, frontend responsiveness, and integration of third party services within a real world application.

---

# ✨ Features

## 👤 User Features

     * User Registration & Login
     * JWT Authentication
     * Browse Properties
     * Search Properties by City & Type
     * Wishlist / Favourite Properties
     * Property Detail View
     * Contact & Inquiry System
     * Responsive UI Design
     * Real-Time Chat using Socket.IO

## 🛠️ Admin / Seller Features

     * Add New Properties
     * Edit Property Details
     * Delete Properties
     * Manage Property Listings
     * Manage User Inquiries
     * Admin Dashboard

---

# 🛠️ Technologies Used

## 🎨 Frontend

    * React.js
    * React Router DOM
    * Axios
    * Tailwind CSS
    * React Icons

## ⚙️ Backend

    * Node.js
    * Express.js
    * MongoDB
    * Mongoose
    * JWT Authentication
    * Socket.IO

## 🔧 Development Tools

    * Visual Studio Code
    * Git & GitHub
    * Postman
    * MongoDB Compass
    * npm

---

# 📂 Project Structure

```bash
REAL-MANAGEMENT-SYSTEM/
│
├── backend/
│   ├── config/
│   │       ├── cloudinary.js
│   │       └─ db.js
│   ├── controllers/
│   │       ├── admin.controllor.js
│   │       ├── auth.controller.js
│   │       ├── contact.controller.js
│   │       ├── inquiry.controller.js
│   │       ├── property.controller.js
│   │       ├── user.controller.js
│   │       └─ wishlist.controller.js
│   ├── middleware/
│   │       ├── auth.middleware.js
│   │       └─ upload.middleware.js
│   ├── models/
│   │       ├── chat.model.js
│   │       ├── contact.model.js
│   │       ├── inquiry.model.js
│   │       ├── property.model.js
│   │       ├── user.model.js
│   │       └─ wishlist.model.js
│   ├── node_modules/
│   ├── routes/
│   │       ├── admin.routes.js
│   │       ├── auth.routes.js
│   │       ├── chat.routes.js
│   │       ├── contact.routes.js
│   │       ├── inquiry.routes.js
│   │       ├── property.routes.js
│   │       ├── user.routes.js
│   │       └─ wishlist.routes.js
│   ├── utils/
│   │       ├── sendEmail.js
│   │       └─ uploadToCloudinary.js
│   ├── .env
│   ├── package-lock.json
│   ├── package.json
│   └── server.js



├── frontend/
│    ├── node_modules/
│    ├── public/
│                └─ favicon.png
│   ├── src/
│   │   ├── assets/
│   │   │             ├── bannerimage.png
│   │   │             ├── dummyStyles.js
│   │   │             ├── hexagonlogo1.png
│   │   │             ├── R1.png
│   │   │             ├── R2.png
│   │   │             ├── R3.png
│   │   │             ├── R4.png
│   │   │             ├── R12.png
│   │   │             ├── R13.png
│   │   │             ├── R21.png
│   │   │             ├── R22.png
│   │   │             ├── R31.png
│   │   │             ├── R41.png
│   │   │             └─ R42.png
│   │   ├── components/
│   │   │              ├── common/
│   │   │              │           ├── Logo.jsx
│   │   │              │           ├── Navbar.jsx
│   │   │              │           ├── PropertyCard.jsx
│   │   │              │           ├── ProtectedRoute.jsx
│   │   │             ├── AdminLayout.jsx
│   │   │             ├── Admin.Sidebar.jsx
│   │   │             ├── DashboardNavbar.jsx
│   │   │             ├── SellerLayout.jsx
│   │   │             └─ SellerSidebar.jsx
│   │   ├── context/
│   │   │            ├── AuthContext.jsx
│   │   │             ├── AuthProvider.jsx
│   │   │             ├── ChatContext.jsx
│   │   │             ├── ChatProvider.jsx
│   │   │             ├── useAuth.jsx
│   │   │             └─ useChat.jsx
│   │   ├── pages/
│   │   │             ├── admin/
│   │   │             │          ├── AdminContacts.jsx
│   │   │             │          ├── AdminDashboard.jsx
│   │   │             │          ├── AdminInquiries.jsx
│   │   │             │          ├── AdminProperties.jsx
│   │   │             │          ├── AdminUsers.jsx
│   │   │             │          └─ SellerRequests.jsx
│   │   │            ├── auth/
│   │   │             │           ├── ForgotPassword.jsx
│   │   │             │           ├── Login.jsx
│   │   │             │           ├── Register.jsx
│   │   │             │           ├── ResetPassword.jsx
│   │   │             │           └─ VerifyEmail.jsx
│   │   │             ├── buyer
│   │   │             │           ├── MyInquiries.jsx
│   │   │             │           └─ Wishlist.jsx
│   │   │            ├── seller
│   │   │             │           ├── AddProperty.jsx
│   │   │             │           ├── EditProperty.jsx
│   │   │             │           ├── MyProperties.jsx
│   │   │             │           ├── PendingApproval.jsx
│   │   │             │           └─ SellerDashboard.jsx
│   │   │            ├── shared
│   │   │             │           ├── ChatMessages.jsx
│   │   │             │           ├── Contact.jsx
│   │   │             │           ├── LandingPage.jsx
│   │   │             │           ├── Profile.jsx
│   │   │             │           ├── Properties.jsx
│   │   │             │           └─ PropertyDetails.jsx
│   │   ├──routes/
│   │   │            ├── ProtectedRoute.jsx
│   │   │            └─ PublicRoute.jsx
│   │   ├── utils/
│   │   │            └─ axios.js
│   │   ├── App.jsx
│   │   ├── config.js
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── socket.js
│   │   ├── .gitignore
│   │   ├── eslint.config.js
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── README.md
│   │   └── vite.config.js

```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

# 🚀 Installation & Setup

## 📥 Clone Repository

```bash
git clone <repository-url>
cd RealEstate
```

---

# ⚙️ Backend Setup

```bash
cd backend
npm install
npm start
```

Backend will run on:

```bash
http://localhost:5000
```

---

# 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

# 📡 API Routes

## 🔑 Authentication APIs

```bash
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
```

## 🏘️ Property APIs

```bash
GET    /api/property
GET    /api/property/:id
POST   /api/property
PUT    /api/property/:id
DELETE /api/property/:id
```

## ❤️ Wishlist APIs

```bash
GET    /api/wishlist
POST   /api/wishlist/:propertyId
DELETE /api/wishlist/:propertyId
```

## 📩 Inquiry APIs

```bash
POST   /api/inquiry
GET    /api/inquiry
```

## 💬 Chat APIs

```bash
POST   /api/chat
GET    /api/chat
```

---

# 🔐 Authentication System

This project uses JWT (JSON Web Token) authentication.

Protected routes require:

```bash
Authorization: Bearer <token>
```

---

# ❤️ Wishlist Functionality

Users can:

- Add properties to wishlist
- Remove properties from wishlist
- View saved properties

Wishlist updates instantly using React state management.

---

# 💬 Real-Time Chat System

Socket.IO is integrated for real-time messaging between users.

Features:

- Join chat rooms
- Send messages instantly
- Receive real-time updates

---

# 📱 Responsive UI Features

- Modern responsive design
- Clean property cards
- Interactive wishlist toggle
- Property categories
- Search & filtering
- Loading states
- Error handling

---

# 🚧 Future Enhancements

- Payment Integration
- Google Maps Integration
- Image Upload Optimization
- Notifications System
- AI Property Recommendations
- Property Booking System

---

# 👨‍💻 Author

## Majjari Jasvanth Kumar

Full Stack Developer

Skills:

- Java
- Spring Boot
- React.js
- Node.js
- MongoDB
- MySQL

---

# 📄 License

This project is developed for educational and portfolio purposes.
