# WAGERVERSE

WAGERVERSE is a modern, full-stack e-sports betting platform. It provides a seamless experience for users to bet on their favorite teams across various e-sport tournaments. The application features real-time odds, a secure user authentication system, a personalized dashboard, and a comprehensive admin panel for platform management.

## Key Features

- **User Authentication:** Secure sign-up and login functionality managed by Supabase Auth. New users receive a welcome bonus to start betting.
- **Live Match Listings:** Browse upcoming e-sports matches with details on teams, games, and real-time betting odds.
- **Betting System:** Place bets on teams with a specified amount. The system validates user balance before confirming a bet.
- **User Dashboard:** A personalized space for users to track their balance, total amount wagered, total winnings, profit/loss, and view their complete betting history.
- **Admin Panel:** A role-protected dashboard for administrators to manage the platform's core data, including creating and deleting teams and matches.
- **Secure & Scalable Backend:** Built on Supabase, utilizing PostgreSQL with Row Level Security (RLS) policies to ensure data is secure and only accessible by authorized users.

## Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **UI Framework:** shadcn/ui
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Data Fetching & State Management:** TanStack Query
- **Form Handling:** React Hook Form with Zod for validation

## Architecture

For a high-level overview of the application's components and their interactions, please refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) file.

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

- Node.js (v18 or later)
- npm or a compatible package manager
- A Supabase account

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

    - Create a new project on [Supabase](https://supabase.com).
    - Navigate to the **SQL Editor** in your Supabase project dashboard.
    - Copy the content of `superbase/migrations/20251002134752_8cc0eaac-a255-4363-84fc-c56714f3175b.sql` and run it to set up your database schema, roles, and security policies.
    - **Important: Deploy the atomic betting function:**
      - In the SQL Editor, execute the following function to enable atomic bet placement and prevent negative balances:

      ```sql
      CREATE OR REPLACE FUNCTION public.place_bet_atomic(
          p_user_id uuid,
          p_match_id uuid,
          p_team_id uuid,
          p_bet_amount numeric,
          p_odds numeric
      )
      RETURNS TABLE(success boolean, message text)
      LANGUAGE plpgsql
      SECURITY DEFINER AS $$
      DECLARE
          current_balance numeric;
          potential_winnings numeric;
      BEGIN
          SELECT balance INTO current_balance
          FROM public.profiles
          WHERE id = p_user_id
          FOR UPDATE;

          IF current_balance < p_bet_amount THEN
              RETURN QUERY SELECT FALSE, 'Solde insuffisant';
              RETURN;
          END IF;
          
          potential_winnings := p_bet_amount * p_odds;

          UPDATE public.profiles
          SET
              balance = balance - p_bet_amount,
              total_bet = COALESCE(total_bet, 0) + p_bet_amount
          WHERE id = p_user_id;

          INSERT INTO public.bets (user_id, match_id, team_id, amount, odds, potential_win, status)
          VALUES (p_user_id, p_match_id, p_team_id, p_bet_amount, p_odds, potential_winnings, 'pending');

          RETURN QUERY SELECT TRUE, 'Pari placé avec succès';

      EXCEPTION
          WHEN OTHERS THEN
              RETURN QUERY SELECT FALSE, 'Erreur interne lors du placement du pari.';
      END;
      $$;

      GRANT EXECUTE ON FUNCTION public.place_bet_atomic(uuid, uuid, uuid, numeric, numeric) TO authenticated;
      ```

4.  **Configure environment variables:**

    - **⚠️ Security Warning:** Do NOT commit your `.env` file to version control.
    - Create a `.env` file in the root of the project by copying `public/.env.example`:
    ```bash
    cp public/.env.example .env
    ```
    - Navigate to **Project Settings > API** in your Supabase dashboard.
    - Copy the **Project URL** and the **anon (public) Key** into your `.env` file:

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

### Done

- **Odds Management per Team:** Implemented a system for managing betting odds, allowing administrators to set specific odds for each team participating in a match.
- **Robust Form Validation:** Integrated Zod with React Hook Form for comprehensive client-side form validation, ensuring data integrity before submission.
- **Dedicated Service Layer:** Introduced a service layer to centralize and encapsulate Supabase API calls, improving code organization, reusability, and maintainability.
- **Atomic Bet Transactions:** Implemented atomic betting logic using a PostgreSQL function to prevent race conditions and ensure consistent user balances during bet placement.
- **Enhanced Error Handling:** Added `try/catch` blocks across critical API calls and authentication flows for more robust error management and user feedback.
- **Custom Confirmation Dialogs:** Replaced native `window.confirm()` alerts with custom `AlertDialog` components from `shadcn/ui` for a more integrated and consistent user experience.
- **Magic Number Refactoring:** Replaced hardcoded numerical values with named constants for improved readability, easier maintenance, and better adherence to coding standards.
- **List Pagination:** Implemented pagination for team and match listings in the admin panel, improving performance and user experience for large datasets.
- **Debounce Hook:** Created a `useDebounce` hook available for future use in optimizing input-triggered operations, although current application inputs do not present immediate performance bottlenecks requiring its implementation.

### To Do

- **Link Match Format to Wins:** Link the match format (e.g., BO3, BO5) to the number of wins generated by the database trigger to automatically determine the match winner.
- **Tournament Management Integration:** Develop a comprehensive system for creating, managing, and displaying e-sports tournaments, including brackets, schedules, and results.
- **Live Betting:** Introduce real-time betting capabilities, allowing users to place bets during live matches with dynamically updating odds.
- **User Leaderboards:** Implement leaderboards to showcase top bettors, fostering competition and engagement.
- **Advanced Analytics for Admins:** Provide administrators with detailed analytics and reporting tools to monitor platform performance, user activity, and betting trends.
- **Push Notifications:** Integrate push notifications for match reminders, bet results, and important platform updates.
- **Multi-language Support:** Expand the platform's reach by adding support for multiple languages.
