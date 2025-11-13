# WAGERVERSE

WAGERVERSE is a modern, full-stack e-sports betting platform. It provides a seamless experience for users to bet on their favorite teams across various e-sport tournaments. The application features real-time odds, a secure user authentication system, a personalized dashboard, and a comprehensive admin panel for platform management.

## Key Features

*   **User Authentication:** Secure sign-up and login functionality managed by Supabase Auth. New users receive a welcome bonus to start betting.
*   **Live Match Listings:** Browse upcoming e-sports matches with details on teams, games, and real-time betting odds.
*   **Betting System:** Place bets on teams with a specified amount. The system validates user balance before confirming a bet.
*   **User Dashboard:** A personalized space for users to track their balance, total amount wagered, total winnings, profit/loss, and view their complete betting history.
*   **Admin Panel:** A role-protected dashboard for administrators to manage the platform's core data, including creating and deleting teams and matches.
*   **Secure & Scalable Backend:** Built on Supabase, utilizing PostgreSQL with Row Level Security (RLS) policies to ensure data is secure and only accessible by authorized users.

## Tech Stack

*   **Frontend:** React, Vite, TypeScript
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
*   **UI Framework:** shadcn/ui
*   **Styling:** Tailwind CSS
*   **Routing:** React Router
*   **Data Fetching & State Management:** TanStack Query
*   **Form Handling:** React Hook Form with Zod for validation

## Database Schema

The application's database is managed through Supabase and the schema is defined in the migration file located at `superbase/migrations/`.

Key tables include:
- `games`: Stores e-sport game titles.
- `teams`: Contains information about participating teams.
- `matches`: Details on scheduled and completed matches, including scores.
- `bets`: Records all user bets, including amount, odds, and status.
- `profiles`: Extends the `auth.users` table to manage user-specific data like balance and betting statistics.
- `user_roles`: Manages user roles (e.g., `admin`, `user`) for access control.

Row Level Security (RLS) is enabled on all tables to ensure data integrity and security. For instance, users can only view their own bets and profile information, while administrators have broader access for management purposes.

## Getting Started

To run WAGERVERSE locally, follow these steps:

### Prerequisites

*   Node.js (v18 or later)
*   npm or a compatible package manager
*   A Supabase account

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LoricWorms/WAGERVERSE.git
    cd WAGERVERSE
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your Supabase project:**
    *   Create a new project on [Supabase](https://supabase.com).
    *   Navigate to the **SQL Editor** in your Supabase project dashboard.
    *   Copy the content of `superbase/migrations/20251002134752_8cc0eaac-a255-4363-84fc-c56714f3175b.sql` and run it to set up your database schema, roles, and security policies.

4.  **Configure environment variables:**
    *   Create a `.env` file in the root of the project.
    *   Navigate to **Project Settings > API** in your Supabase dashboard.
    *   Copy the **Project URL** and the **anon (public) Key** into your `.env` file:
      ```env
      VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
      VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY
      ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:8080`.

## Future Enhancements

Here are some ideas for future development and enhancements:

*   **Odds Management per Team:** Implement a more granular system for managing betting odds, allowing administrators to set specific odds for each team participating in a match.
*   **Tournament Management Integration:** Develop a comprehensive system for creating, managing, and displaying e-sports tournaments, including brackets, schedules, and results.
*   **Live Betting:** Introduce real-time betting capabilities, allowing users to place bets during live matches with dynamically updating odds.
*   **User Leaderboards:** Implement leaderboards to showcase top bettors, fostering competition and engagement.
*   **Advanced Analytics for Admins:** Provide administrators with detailed analytics and reporting tools to monitor platform performance, user activity, and betting trends.
*   **Push Notifications:** Integrate push notifications for match reminders, bet results, and important platform updates.
*   **Multi-language Support:** Expand the platform's reach by adding support for multiple languages.
*   **Payment Gateway Integration:** Implement secure payment gateways for easier deposit and withdrawal of funds.

