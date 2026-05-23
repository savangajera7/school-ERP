# School ERP Development & Design Plan

This plan outlines the strategy for designing the UI, improving the backend, and implementing the React Native mobile application.

## 1. UI Design Plan

### A. Admin Web Dashboard (Website)
- **Design Goal**: Data-intensive but clean, focusing on quick actions and overview stats.
- **Key Screens**:
    - **Global Dashboard**: Widgets for Today's Attendance, Unpaid Fees (Total), Student/Staff Birthdays, and Recent Inquiries.
    - **Student Management**: Advanced grid with filters, PDF export for student lists, and LC (Leaving Certificate) Generator.
    - **Fees Portal**: Dashboard for collection trends and automated reminders for unpaid fees.
    - **Library & Transport**: Simple management modules for inventory and route tracking.

### B. Teacher App (Mobile)
- **Design Goal**: Utility-first, optimized for quick data entry (Attendance & Marks).
- **Key Screens**:
    - **Quick Attendance**: One-tap marking for students.
    - **Mark Entry**: Spreadsheet-like interface for entering subject marks.
    - **Assignment Manager**: Uploading photos of homework/assignments directly from the camera.

### C. Parent / Student App (Mobile)
- **Design Goal**: Informational and engaging, focusing on the child's progress.
- **Key Screens**:
    - **Home**: Quick view of today's attendance, upcoming exams, and latest homework.
    - **Academic Record**: Visual charts for result trends over time.
    - **Fees**: Integrated Razorpay payment flow with digital receipts.

---

## 2. Backend Improvement & API Plan

### A. Security Enhancements
- **JWT Implementation**: Replace or augment `ApiKey` with JWT for user sessions.
- **Encryption**: Ensure sensitive data (Passwords, Aadhaar numbers) are encrypted at rest.
- **Rate Limiting**: Implement rate limiting on Login and OTP endpoints to prevent brute force.

### B. New API Requirements
- **Dashboard API**: A single endpoint to fetch all dashboard widget data in one request.
- **File Management**: Dedicated endpoints for PDF generation (LC, Marksheets, Fee Receipts).
- **Notification Service**: Integration with Firebase (FCM) for push notifications and WhatsApp API for alerts.
- **Import/Export**: Bulk import students/staff from Excel/CSV files.

---

## 3. React Native Mobile App Plan

### Phase 1: Core Foundation (Current)
- [x] Base project structure and navigation.
- [x] Axios instance with ApiKey/Auth interceptors.
- [x] Basic Auth flow (Login/Logout).

### Phase 2: Dashboard & Profile (Next)
- [ ] Implement role-specific dashboards (Admin, Teacher, Parent).
- [ ] Design and integrate "Student Profile" with full history.

### Phase 3: Academic & Attendance
- [ ] Integrate Daily Attendance marking (Teacher) and viewing (Parent).
- [ ] Build the Results module with detailed marksheet views.
- [ ] Add Timetable and Calendar views.

### Phase 4: Financials & Interactive
- [ ] Integrate **Razorpay** SDK for fee payments.
- [ ] Implement Homework/Assignment download and submission.
- [ ] Add Online Exam module.

### Phase 5: Polishing & Testing
- [ ] Push notification integration (FCM).
- [ ] Offline data caching for basic views (Attendance/Timetable).
- [ ] End-to-end testing with backend.
