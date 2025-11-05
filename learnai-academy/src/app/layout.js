export const metadata = { title: "LearnAI Academy", description: "AI-powered learning." };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
