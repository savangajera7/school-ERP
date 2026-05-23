# Backend Role-Based Access Control (RBAC) Specification

This document outlines the access levels and permissions for each user role in the School ERP system.

## 1. Admin Role (Super User)
The Admin has full access to the system, including configuration and user management.

### Access Levels:
- **User Management**: Create, update, delete, and view all users (Teachers, Parents, Students).
- **Academic Setup**: Manage Academic Years, Classes, Sections, Batches, and Subjects.
- **Student Admission**: Full control over Inquiry, Admission Forms, and Profile management.
- **Fees Management**: Configure fee structures, collect fees, view reports, and manage unpaid fees.
- **Attendance**: View all attendance reports (Staff & Students), edit attendance if necessary.
- **Exam & Results**: Create exams, manage mark entry permissions, and publish results.
- **Reports**: Access to all system reports (Top 10 students, Absentee list, Staff leaves, LC Generator).
- **Communication**: Send SMS/WhatsApp alerts to all or specific groups.
- **Settings**: Manage system settings, library configuration, transport details, and payment gateways (Razorpay).

---

## 2. Teacher Role
Teachers have access to academic and classroom management tools for their assigned classes.

### Access Levels:
- **Attendance**: Mark daily attendance for assigned classes, view monthly reports.
- **Student Profile**: View student profiles and history for students in their classes.
- **Exams & Marks**: Enter marks for assigned subjects/classes, view class-wise results.
- **Timetable**: View personal and class timetables.
- **Homework / Assignments**: Create, distribute, and evaluate homework/assignments.
- **Communication**: Send messages/alerts to parents of students in their classes.
- **Leave Management**: Apply for leaves, view personal leave status.

---

## 3. Parent / Student Role
Parents and Students have read-only access to their own data and specific interactive features.

### Access Levels:
- **Profile**: View personal/child profile and academic history.
- **Attendance**: View daily/monthly attendance status and alerts.
- **Results**: View published exam results and marksheet.
- **Fees**: View fee status, payment history, and pay online via Razorpay.
- **Timetable**: View class and exam timetables.
- **Homework**: View and download assignments/homework.
- **Notices**: Receive school-wide or class-specific messages and circulars.
- **Online Exams**: Participate in online exams (for students).

---

## 4. API Security Requirements (Recommendations)
- **Authentication**: Use JWT (JSON Web Tokens) with a 1-hour expiry.
- **Authorization**: Implement middleware to check `RoleID` on every request.
- **Data Scoping**: Ensure that Parents/Students can only access data where `StudentID` matches their own record.
- **Input Validation**: Strict validation for all POST/PUT requests to prevent SQL injection and XSS.
- **Audit Logs**: Record all Admin actions and sensitive data changes (e.g., fee collection, mark entry).
