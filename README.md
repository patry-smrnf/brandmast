# 🗓️ Availability Management Frontend

This is the **frontend layer** of a web application designed to manage employee availability. The system offers tools for both employees and management to track, schedule, and report working hours and tasks efficiently.

## 🚀 Features

### For Employees
- Add and manage availability actions.
- Select store locations via an interactive map or by entering an address.
- Filter actions by store type and status (upcoming / completed).
- View a summary of total working hours (planned vs actual).

### For Management
- Overview of all employees and their scheduled actions in a calendar.
- Export all actions to Excel format.
- Manage available stores and assign them to employees.
- Add and remove employee records.
- Access charts and visual summaries of working hours.
- Share guides and documentation with employees.

---

## 📂 App Structure

| Path               | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `/SVDashBoard`     | Dashboard for management: employee list, calendar view, Excel export.       |
| `/SVShopBoard`     | Table of stores assigned to the SV team and their members.                  |
| `/SVBmChart`       | Manage employee list: add/remove members.                                   |
| `/BMDashBoard`     | Employee dashboard to view and manage actions. Includes smart filtering.    |
| `/BMChartBoard`    | Charts and summaries comparing scheduled vs real hours.                     |
| `/BMHelperPage`    | Guides and how-tos to assist employees.                                     |

---

## 🧱 Tech Stack

| Technology        | Description                                      |
|-------------------|--------------------------------------------------|
| **React**         | Core library for building the UI                |
| **TypeScript**    | Type-safe development experience                 |
| **Tailwind CSS**  | Utility-first styling framework                  |
| **ShadCN UI**     | Accessible and beautiful UI components           |
| **Lucide Icons**  | Clean and modern icon set for React             |

