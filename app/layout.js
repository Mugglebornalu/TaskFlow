import "./globals.css";

export const metadata = {
  title: "Taskflow — Plan clearly, make progress",
  description: "A simple task manager with dates, timelines and progress tracking."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
