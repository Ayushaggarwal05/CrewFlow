# CrewFlow — Multi-Tenant SaaS Project Management

![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

CrewFlow is a production-grade, multi-tenant SaaS platform designed for high-velocity teams. It solves the complexity of managing parallel projects across distributed organizations with a focus on strict data isolation, granular RBAC, and real-time interaction.

## 🚀 Key Features

- **Enterprise-Grade RBAC**: A custom permission system handling four hierarchy levels (Admin, Manager, Lead, Member), ensuring users only access scoped data.
- **Strict Data Multi-Tenancy**: Server-side queryset filtering that guarantees zero data leakage between organizations and teams.
- **Dynamic Kanban Engine**: A fluid, drag-and-drop interface built with `@dnd-kit`, featuring optimistic UI updates for a lag-free experience.
- **Secure Invite System**: Expiring, role-aware join codes that simplify onboarding while maintaining organizational security.
- **Real-time Activity Analytics**: Automated signal-based logging that feeds a dynamic activity stream and organization-wide velocity metrics.

## 🧠 Architectural Highlights

### 1. Robust Data Isolation
The backend leverages a centralized permission layer (`IsMemberOrAbove`) and custom utility functions to resolve organization-level access before any database operation. This prevents "ID guessing" attacks and ensures multi-tenant integrity at the database level.

### 2. Scalable State Management
Utilizes **Redux Toolkit** with a modular slice architecture. This enables centralized management of complex organizational stats, user permissions, and real-time task updates without unnecessary re-renders.

### 3. Resilience & Error Normalization
Implemented a custom API interceptor layer in Axios to handle:
- **Global Error Normalization**: Converting disparate backend validation errors into human-readable notifications.
- **JWT Rotation**: Seamlessly handling token expiry and refreshing without interrupting the user session.
- **Optimistic Updates**: Improving perceived performance by updating the UI immediately while syncing with the backend in the background.

## 🛠️ Technology Stack

- **Backend**: Django 5.x, Django REST Framework (DRF), PostgreSQL
- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS
- **Interactions**: Lucide Icons, Framer Motion (animations), @dnd-kit
- **DevOps/Tools**: JWT Auth, Django Signals, Custom Middleware

## 📂 Project Structure

```text
CrewFlow/
├── backend/            # Django API Server
│   ├── apps/           # Modular apps (users, organizations, teams, tasks, activity)
│   ├── config/         # System settings and global routing
│   └── common/         # Reusable middleware, renderers, and permissions
├── frontend/           # React Client
│   ├── src/
│   │   ├── app/        # Redux Store & Router config
│   │   ├── features/   # Domain-driven modules (Auth, Projects, Tasks)
│   │   ├── services/   # API Layer & Interceptors
│   │   └── components/ # Atomic UI Design System
└── README.md
```

## ⚙️ Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📈 Challenges Overcome
- **Complex Signal Handling**: Solved race conditions in activity logging by implementing atomic transaction-aware signals in Django.
- **State Synchronization**: Unified ID handling across string-based URL params and numeric database IDs to ensure zero-lag Kanban transitions.
- **Permission Granularity**: Developed a recursive role-resolution utility that checks both explicit project memberships and organization-level inheritance.

---
**Built with ❤️ by Ayush Aggarwal**
