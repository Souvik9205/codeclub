import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/pages/extra/modal";
import { AvatarSelect } from "@/pages/extra/avatarSelect";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(
    "https://i.pinimg.com/736x/62/87/26/62872606328a29ace159c2e03926b4df.jpg"
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");

    if (storedUserId && storedToken) {
      setIsAvatarLoading(true);
      setUserId(storedUserId);
      setToken(storedToken);
      fetchUserData(storedUserId, storedToken);
    }
  }, []);

  const fetchAvatar = async (id: number | null) => {
    if (!id) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/avatars/${id}`
      );
      if (response.data && response.data.imageUrl) {
        setAvatarUrl(response.data.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const fetchUserData = async (id: string, token: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/user/metadata/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      console.log(data);
      if (data && data.res) {
        setUserName(data.res.username || "John Doe");
        setAvatarId(data.res.avatarId || null);
        fetchAvatar(data.res.avatarId);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleAvatarSelect = async (newAvatarId: number) => {
    setIsAvatarLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/v1/user/metadata/avatar",
        {
          userId,
          avatarId: newAvatarId,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      setAvatarId(newAvatarId);
      await fetchAvatar(newAvatarId);
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setIsAvatarLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ecf0f3] text-[#1A202C]">
      <div className="relative min-h-screen bg-[#ecf0f3] text-[#1A202C] overflow-hidden">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-6 shadow-md bg-white z-10 relative hover:shadow-lg transition duration-300">
          <motion.h1
            className="text-2xl font-bold text-[#2A4365]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            GatherClone
          </motion.h1>
          <div className="flex space-x-4 text-[#4A5568] font-semibold">
            <Button
              variant="outline"
              className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
            >
              Update Username
            </Button>
            <div className="ml-4 w-8 h-8 bg-[#3182CE] rounded-full flex items-center justify-center shadow-md">
              <User className="text-white" />
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="py-10 px-8">
          <motion.h2
            className="text-3xl font-semibold text-[#2A4365]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Hello, {userName}!
          </motion.h2>
          <div className="flex items-center mt-6">
            <motion.div
              className="relative rounded-full w-32 h-32 object-cover overflow-hidden mr-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {isAvatarLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <span className="loader" />
                </div>
              ) : (
                <img src={avatarUrl} alt="User Avatar" />
              )}
            </motion.div>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="text-[#3182CE]"
            >
              Edit Avatar
            </Button>
          </div>

          {/* Edit Username */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold">Change Username</h3>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-2"
              placeholder="Enter new username"
            />
          </div>

          {/* Delete Account */}
          <div className="mt-8">
            <Button variant="outline" className="text-red-600">
              Delete Account
            </Button>
          </div>
        </div>

        {/* Avatar Select Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <AvatarSelect onSelect={handleAvatarSelect} />
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
