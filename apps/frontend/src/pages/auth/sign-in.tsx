import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const loginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

interface LoginFormValues {
  username: string;
  password: string;
}

const Signin = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (passwordVisible) {
      timer = setTimeout(() => setPasswordVisible(false), 3000); // Auto-hide after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [passwordVisible]);

  const handleLogin = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/signin",
        values
      );
      console.log("Login Successful:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);

      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Login Error:", error);
      setStatus({ error: error.response?.data?.message || "Login failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen bg-[#f2f5f6] text-[#1A202C] px-8 overflow-hidden">
      {/* SVG Waves Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute top-0 w-full "
        >
          <path fill="#DAE8EF" d="M0,32L1440,160L1440,0L0,0Z"></path>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute -bottom-16 w-full "
        >
          <path fill="#DAE8EF" d="M0,96L1440,224L1440,320L0,320Z"></path>
        </svg>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="bg-gradient-to-tr from-gray-100 via-gray-300 to-slate-100 border border-blue-700 shadow-2xl rounded-lg p-10 w-full max-w-xl relative z-10"
      >
        <h2 className="text-4xl font-bold text-center mb-8 tracking-tight">
          Login
        </h2>

        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-6">
              {status?.error && (
                <Alert variant="destructive" className="mb-4">
                  {status.error}
                </Alert>
              )}

              {/* Username Field */}
              <div className="relative">
                <label className="text-md text-[#1A202C] mb-2 block">
                  Username
                </label>
                <Field
                  name="username"
                  as={Input}
                  type="text"
                  placeholder="Enter your username"
                  className="w-full rounded-lg shadow-lg focus:ring-2 focus:ring-[#4299E1] transition duration-300 ease-in-out bg-neutral-300/50 border border-neutral-100"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="text-md text-[#1A202C] mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Field
                    name="password"
                    as={Input}
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-lg shadow-lg focus:ring-2 focus:ring-[#4299E1] transition duration-300 ease-in-out bg-neutral-300/50 border border-neutral-100"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg border-l border-neutral-100 pl-4 focus:outline-none"
                    onClick={() => setPasswordVisible(true)}
                  >
                    {passwordVisible ? (
                      <FiEyeOff className="text-gray-600 hover:text-blue-500" />
                    ) : (
                      <FiEye className="text-gray-600 hover:text-blue-500" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#4299E1] w-full py-3 rounded-lg shadow-lg hover:bg-[#2B6CB0] transition-colors duration-300 ease-in-out"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </Form>
          )}
        </Formik>

        {/* Redirect to Signup */}
        <p className="mt-6 text-center text-sm text-[#1A202C]">
          No account?{" "}
          <Link
            to="/signup"
            className="text-[#4299E1] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default Signin;
