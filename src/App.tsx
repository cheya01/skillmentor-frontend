// App.tsx
import { BrowserRouter, Routes, Route } from "react-router"; // ← not "react-router"
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import PostAuth from "@/pages/PostAuth";
import AdminDB from "@/pages/AdminDB";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        {/* Optional: mount RoleBootstrapper here if you use it */}
        {/* <SignedIn><RoleBootstrapper /></SignedIn> */}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/post-auth" element={<PostAuth />} />

          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn><DashboardPage /></SignedIn>
                <SignedOut><LoginPage /></SignedOut>
              </>
            }
          />

          <Route
            path="/admin"
            element={
              <>
                <SignedIn><AdminDB /></SignedIn>
                <SignedOut><LoginPage /></SignedOut>
              </>
            }
          />

          <Route
            path="/payment/:sessionId"
            element={
              <>
                <SignedIn><PaymentPage /></SignedIn>
                <SignedOut><LoginPage /></SignedOut>
              </>
            }
          />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;
