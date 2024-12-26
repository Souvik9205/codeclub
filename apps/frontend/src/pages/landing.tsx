import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  Linkedin,
  Facebook,
  Instagram,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toaster";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 0.5 },
    }),
  };

  return (
    <div className="relative min-h-screen bg-[#ecf0f3] text-[#1A202C] overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="fill-current text-[#3f9ccb]"
        >
          <path d="M0,64L40,96C80,128,160,192,240,218.7C320,245,400,235,480,213.3C560,192,640,160,720,138.7C800,117,880,107,960,112C1040,117,1120,139,1200,160C1280,181,1360,203,1400,213.3L1440,224L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
        </svg>
      </div>

      <nav className="flex justify-between items-center px-8 py-6 shadow-md bg-white z-10 relative hover:shadow-lg transition duration-300">
        <motion.h1
          className="text-2xl font-bold text-[#2A4365]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <a href="/">GatherClone</a>
        </motion.h1>
        <div className="flex space-x-7 text-[#4A5568] font-semibold">
          <a
            href="#features"
            style={{ scrollBehavior: "smooth" }}
            className="hover:text-[#3182CE] transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#newsletter"
            className="hover:text-[#3182CE] transition-colors duration-200"
          >
            Newsletter
          </a>
          <a
            href="#footer"
            className="hover:text-[#3182CE] transition-colors duration-200"
          >
            Contact
          </a>
          <Button
            variant="outline"
            className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
            onClick={() => navigate("/signin")}
          >
            Join Now
          </Button>
          <div
            className="ml-4 w-9 h-9 bg-[#3182CE] rounded-full flex items-center justify-center shadow-md hover:bg-[#2f6ba2] hover:scale-110 transition duration-200"
            onClick={() => navigate("/dashboard")}
          >
            <User className="text-white cursor-pointer hover:scale-125 transition duration-200" />
          </div>
        </div>
      </nav>

      <header className="relative flex flex-col items-center text-center py-24 px-6 z-10">
        <motion.h2
          className="text-5xl font-bold text-[#2A4365] transition-all"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          Meet, Interact, and Create Together
        </motion.h2>
        <motion.p
          className="mt-6 max-w-2xl text-[#4A5568]"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          Experience virtual gatherings with a customized space that brings
          people closer.
        </motion.p>
        <motion.div
          className="mt-8 flex space-x-4"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <Button
            variant="default"
            className="bg-[#3182CE] text-white hover:bg-[#2C5282]"
            onClick={() => navigate("/space")}
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
          >
            <a href="#features">Learn More</a>
          </Button>
        </motion.div>
      </header>

      <section id="features" className="py-20 bg-[#F7FAFC] relative z-10">
        <h3 className="text-3xl font-bold text-center text-[#2A4365]">
          Features
        </h3>
        <p className="text-center text-[#4A5568] mb-12">
          Bringing everyone closer in virtual spaces
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="hover:scale-105 transform transition duration-300"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={i}
            >
              <Card className="bg-white text-[#2A4365] shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-[#3182CE] hover:text-[#2C5282] transition duration-200">
                    {
                      [
                        "Customizable Spaces",
                        "Real-Time Communication",
                        "Engaging Activities",
                      ][i]
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-[#4A5568]">
                  <div className="min-h-[150px] bg-[#E2E8F0] rounded-md mb-4 flex items-center justify-center">
                    <p className="text-[#4A5568]">Image Placeholder</p>
                  </div>
                  {
                    [
                      "Design your unique space with themes, layouts, and interactive features.",
                      "Engage with others using live voice, video, and chat options.",
                      "Participate in games, events, and fun activities with your group.",
                    ][i]
                  }
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="newsletter"
        className="relative flex flex-col items-center py-20 px-8 bg-gradient-to-br from-[#c0c3c7] to-[#396096] text-center shadow-md overflow-hidden"
      >
        {/* Background SVG Design */}
        <svg
          className="absolute -top-10 left-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#1A365D"
            fillOpacity="0.5"
            d="M0,224L48,224C96,224,192,224,288,213.3C384,203,480,181,576,165.3C672,149,768,139,864,154.7C960,171,1056,213,1152,213.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
        <motion.h4
          className="text-4xl font-bold text-[#EDF2F7] mb-6 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Stay Connected
        </motion.h4>
        <motion.p
          className="text-[#E2E8F0] mb-10 relative z-10 max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join our newsletter for exclusive updates and insights.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-lg relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Input
            type="email"
            placeholder="Your Email Address"
            className="flex-1 rounded-lg border-none px-4 py-3 shadow-lg focus:ring-2 focus:ring-[#63B3ED] bg-slate-300 "
          />
          <Button
            variant="default"
            className="bg-[#4299E1] text-white hover:bg-[#2B6CB0] px-6 py-3 rounded-lg shadow-lg flex items-center justify-center"
            onClick={() => {
              toast("sorry, there is no newsletter yet! lol", {
                action: {
                  label: "Close",
                  onClick: () => {
                    return;
                  },
                },
              });
            }}
          >
            Subscribe <ChevronRight className="ml-2" />
          </Button>
        </motion.div>
      </section>

      <footer
        id="footer"
        className="relative py-5 bg-gradient-to-t from-slate-100 to-slate-500 flex justify-between items-center shadow-lg overflow-hidden"
      >
        {/* Background SVG Decoration */}
        <svg
          className="absolute bottom-0 right-0 w-full h-full opacity-25"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#2C5282"
            fillOpacity="0.4"
            d="M0,128L48,138.7C96,149,192,171,288,170.7C384,171,480,149,576,160C672,171,768,213,864,197.3C960,181,1056,107,1152,85.3C1248,64,1344,96,1392,112L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
        <motion.h2
          className="text-2xl font-semibold text-[#4b4f54] ml-4 relative z-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          GatherClone
        </motion.h2>
        <div className="flex space-x-8 text-[#646c77] mr-16 relative z-10">
          <Linkedin className="hover:text-[#020305] transition-colors duration-300 hover:scale-110 cursor-pointer" />
          <Facebook className="hover:text-[#020305] transition-colors duration-300 hover:scale-110 cursor-pointer" />
          <Instagram className="hover:text-[#020305] transition-colors duration-300 hover:scale-110 cursor-pointer" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
