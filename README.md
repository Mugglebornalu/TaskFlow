# Taskflow

A clean, responsive task manager built with **Next.js**, ready to push to GitHub and deploy on Vercel.

## Features

- Create, edit and delete tasks
- Set start dates and due dates
- Track status, priority and percentage progress
- See tasks ordered by due date, with overdue / days-left indicators
- Add timestamped activity updates to each task
- Dashboard summary for total tasks, completed tasks, overall progress and overdue tasks
- Filter and search tasks
- Responsive desktop and mobile layout

## Run locally

Requirements: Node.js 18.18+ (Node 20 LTS recommended) and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To test a production build:

```bash
npm run build
npm start
```

## Deploy with GitHub + Vercel

1. Create a new GitHub repository.
2. Extract this ZIP and push the project files to the repository:

   ```bash
   git init
   git add .
   git commit -m "Initial Taskflow app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

3. Sign in to [Vercel](https://vercel.com), choose **Add New → Project**, and import the GitHub repository.
4. Keep the detected framework as **Next.js** and click **Deploy**. No environment variables are required for this starter.

## Important: where task data is stored

This starter saves tasks in the browser's `localStorage`. That means:

- Data remains available in the same browser on the same device after refreshes.
- No database or setup is needed to try the app.
- Data is **not synced** between devices, browsers or users, and clearing browser data can remove it.

For a multi-device or team version, connect a database such as Supabase (Postgres) and add authentication. The current app is a complete local-first MVP, not a shared cloud database app.

## Suggested next upgrades

- Supabase database and user sign-in
- Email / in-app reminders for approaching due dates
- Project and category grouping
- Drag-and-drop timeline / calendar view
- Team members, comments and task assignments
