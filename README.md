# Jobs API

A robust, production-ready RESTful Node.js API that allows users to track their job applications. Built with Express, MongoDB, and secured with JWT. Included is a beautifully styled, "Vintage Official" themed vanilla JavaScript frontend interface.

**Live Demo:** [https://jobs-api-inhs.onrender.com/](https://jobs-api-inhs.onrender.com/)

## Features

- **User Authentication**: Secure Login and Registration using `bcryptjs` for password hashing and `jsonwebtoken` for secure session management.
- **RESTful Endpoints**: Full CRUD (Create, Read, Update, Delete) capabilities for Job entries.
- **Frontend Dashboard**: A premium, performant, parchment-themed vintage UI to easily interact with the API. 
- **Security Best Practices**: Includes `helmet` for security headers, `xss-clean` to prevent Cross-Site Scripting attacks, `express-rate-limit` to prevent brute force/DDoS attacks, and `cors` for safe cross-origin requests.
- **Error Handling**: Uses `http-status-codes` and custom error classes for clean, predictable responses.
- **Database Storage**: Hosted asynchronously via Mongoose schemas interacting with MongoDB.

---

## Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, FontAwesome
- **Validation & Security**: bcryptjs, jsonwebtoken, helmet, xss-clean, express-rate-limit, cors.
