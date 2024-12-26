import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Instagram, User } from "lucide-react";
import { motion } from "framer-motion";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toaster";

const Space: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [isSpaceModalOpen, setSpaceModalOpen] = useState(false);
  const [maps, setMaps] = useState<Map[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [joinedSpaces, setJoinedSpaces] = useState<Space[]>([]);
  const [selectedMapId, setSelectedMapId] = useState("");

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openMapModal = () => setMapModalOpen(true);
  const closeMapModal = () => setMapModalOpen(false);
  const openSpaceModal = () => setSpaceModalOpen(true);
  const closeSpaceModal = () => setSpaceModalOpen(false);

  const navigate = useNavigate();

  const initialValues = {
    name: "",
    dimensions: "",
    mapId: "",
  };
  const spaceValues = {
    userId: `${localStorage.getItem("userId")}`,
    spaceId: "",
  };

  interface Map {
    id: string;
    name: string;
    thumbnail: string;
    dimensions: string;
  }
  interface Space {
    id: string;
    name: string;
    thumbnail: string;
    dimensions: string;
  }
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/space/all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setSpaces(data.spaces);

        const joinedSpacesResponse = await fetch(
          "http://localhost:3000/api/v1/space/joined",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const joinedSpacesData = await joinedSpacesResponse.json();
        setJoinedSpaces(joinedSpacesData.spaces);
      } catch (e) {
        console.error("Failed to fetch spaces:", e);
      }
    };

    fetchSpaces();
  }, []);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/space/maps");
        const data = await response.json();
        setMaps(data.maps);
      } catch (error) {
        console.error("Failed to fetch maps:", error);
      }
    };

    fetchMaps();
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Space name is required"),
    dimensions: Yup.string().matches(
      /^\d+x\d+$/,
      "Dimensions must be in the format 'widthxheight' (e.g., 800x600)"
    ),
    mapId: Yup.string(),
  });
  const handleSpaceSubmit = async (values: typeof spaceValues) => {
    console.log("Form Data:", values);
    const response = await fetch("http://localhost:3000/api/v1/space/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (data.message === "Space not found") {
      toast("There is no Space with this ID", {
        action: {
          label: "Close",
          onClick: () => {
            return;
          },
        },
      });
    }
    closeSpaceModal();
  };
  const handleSubmit = async (values: typeof initialValues) => {
    console.log("Form Data:", values);
    await fetch("http://localhost:3000/api/v1/space", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(values),
    });
    closeModal();
  };

  const handleMapSelect = (mapId: string) => {
    setSelectedMapId(mapId);
    closeMapModal();
  };

  return (
    <div className="relative min-h-screen bg-[#ecf0f3] text-[#1A202C] overflow-hidden">
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-[#2A4365] mb-4">
              Create New Space
            </h2>
            <Formik
              initialValues={{ ...initialValues, mapId: selectedMapId }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, setFieldValue, values }) => {
                // Sync selectedMapId with the Formik field dynamically
                useEffect(() => {
                  setFieldValue("mapId", selectedMapId);
                }, [selectedMapId, setFieldValue]);

                return (
                  <Form>
                    {/* Name Field */}
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-[#4A5568]"
                      >
                        Name
                      </label>
                      <Field
                        name="name"
                        type="text"
                        placeholder="Enter space name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-sm text-red-600 mt-1"
                      />
                    </div>

                    {/* Dimensions Field */}
                    <div className="mb-4">
                      <label
                        htmlFor="dimensions"
                        className="block text-sm font-medium text-[#4A5568]"
                      >
                        Dimensions
                      </label>
                      <Field
                        name="dimensions"
                        type="text"
                        placeholder="e.g., 800x600"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]"
                      />
                      <ErrorMessage
                        name="dimensions"
                        component="div"
                        className="text-sm text-red-600 mt-1"
                      />
                    </div>

                    {/* Map Selection */}
                    <div className="mb-4">
                      <label
                        htmlFor="mapId"
                        className="block text-sm font-medium text-[#4A5568]"
                      >
                        Map
                      </label>
                      <button
                        type="button"
                        onClick={() => openMapModal()}
                        className="w-full px-4 py-2 border rounded-lg bg-[#f7fafc] focus:outline-none focus:ring-2 focus:ring-[#3182CE] text-left"
                      >
                        {values.mapId
                          ? `Selected Map: ${values.mapId}`
                          : "Choose Map"}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        onClick={closeModal}
                        variant="outline"
                        className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#3182CE] text-white hover:bg-[#2C5282]"
                      >
                        Create
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      )}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-[#2A4365] mb-4">
              Choose a Map
            </h2>
            <div className="grid gap-4">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="flex items-center p-4 border rounded-lg hover:shadow cursor-pointer"
                  onClick={() => handleMapSelect(map.id)}
                >
                  <img
                    src={map.thumbnail}
                    alt={map.name}
                    className="w-16 h-16 rounded-md mr-4 object-cover"
                  />
                  <div>
                    <h3 className="text-[#2A4365] font-medium">{map.name}</h3>
                    <p className="text-sm text-[#4A5568]">{map.dimensions}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
                onClick={closeMapModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      {isSpaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold text-[#2A4365] mb-4">
              Input Space Id
            </h2>
            <Formik initialValues={spaceValues} onSubmit={handleSpaceSubmit}>
              <Form>
                <div className="mb-4">
                  <label
                    htmlFor="spaceId"
                    className="block text-sm font-medium text-[#4A5568]"
                  >
                    Space Id
                  </label>
                  <Field
                    name="spaceId"
                    type="text"
                    placeholder="Enter space id"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3182CE]"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#3182CE] text-white hover:bg-[#2C5282]"
                  >
                    Join
                  </Button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      )}

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
          GatherClone
        </motion.h1>
        <div className="flex space-x-4 text-[#4A5568] font-semibold">
          <a
            href="#features"
            className="hover:text-[#3182CE] transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#examples"
            className="hover:text-[#3182CE] transition-colors duration-200"
          >
            Examples
          </a>
          <a
            href="#newsletter"
            className="hover:text-[#3182CE] transition-colors duration-200"
          >
            Newsletter
          </a>
          <Button
            variant="outline"
            className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
          >
            Join Now
          </Button>
          <div className="ml-4 w-8 h-8 bg-[#3182CE] rounded-full flex items-center justify-center shadow-md">
            <User className="text-white" />
          </div>
        </div>
      </nav>

      <header className="relative flex flex-col items-center text-center pt-24 px-6 z-10">
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
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            className="text-[#2A4365] border-[#3182CE] hover:bg-[#EBF8FF]"
          >
            Learn More
          </Button>
        </motion.div>
      </header>

      <section className="mx-28 mb-40">
        <div className="flex justify-between items-center">
          {/* Toggle Buttons */}
          <div className="flex space-x-4">
            <p className="text-[#3182CE] font-semibold border-b-2 text-lg border-[#3182CE] hover:text-[#2A4365] hover:border-[#2A4365] pb-1">
              My Spaces
            </p>
          </div>
          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <button
              className="bg-[rgb(231,241,252)] text-[#3182CE] border hover:text-[#f4f9ff] border-[#3182CE] px-8 py-2 rounded-lg hover:bg-[#2C5282] transition"
              onClick={openSpaceModal}
            >
              Import Space
            </button>
            <button
              className="bg-[#3182CE] text-white px-8 py-2 rounded-lg hover:bg-[#2C5282] transition"
              onClick={openModal}
            >
              + Create Space
            </button>
          </div>
        </div>

        {/* Space List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {spaces.map((space) => (
            <div
              key={space.id}
              className="relative bg-white border border-[#e2e8f0] rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={
                  space.thumbnail ||
                  "https://i.pinimg.com/736x/23/78/cb/2378cb617fa5bfe8c3495f5066642010.jpg"
                }
                alt={space.name}
                className="w-full h-40 object-cover"
                onClick={() =>
                  navigate(
                    `/arena/?token=${localStorage.getItem("token")}&spaceId=${space.id}&XxY=${space.dimensions}`
                  )
                }
              />
              <div className="absolute top-3 left-2">
                <span className="bg-[#8086fc] border border-[#ffffff] text-white text-sm px-2 py-1 rounded-lg">
                  OWNER
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-600 space-x-1">
                    <span>Space Id : </span>
                    <span>{space.id}</span>
                  </span>
                </div>
                <div className="mt-2 flex w-full justify-between text-lg font-semibold text-[#2D3748] truncate">
                  <div>{space.name}</div>
                  <button className="text-[#3182CE] hover:text-[#2A4365] hover:scale-110 transition rounded-xl shadow-lg">
                    ...
                  </button>
                </div>
              </div>
            </div>
          ))}
          {joinedSpaces.map((space) => (
            <div
              key={space.id}
              className="relative bg-white border border-[#e2e8f0] rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={
                  space.thumbnail ||
                  "https://i.pinimg.com/736x/23/78/cb/2378cb617fa5bfe8c3495f5066642010.jpg"
                }
                alt={space.name}
                className="w-full h-40 object-cover"
                onClick={() =>
                  navigate(
                    `/arena/?token=${localStorage.getItem("token")}&spaceId=${space.id}&XxY=${space.dimensions}`
                  )
                }
              />
              <div className="absolute top-3 left-2">
                <span className="bg-[#80b0fc] border border-[#ffffff] text-white text-sm px-2 py-1 rounded-lg">
                  JOINED
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-gray-600 space-x-1">
                    <span>Space Id : </span>
                    <span>{space.id}</span>
                  </span>
                </div>
                <div className="mt-2 flex w-full justify-between text-lg font-semibold text-[#2D3748] truncate">
                  <div>{space.name}</div>
                  <button className="text-[#3182CE] hover:text-[#2A4365] hover:scale-110 transition rounded-xl shadow-lg">
                    ...
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative py-5 bg-gradient-to-t from-slate-100 to-slate-300 flex justify-between items-center shadow-lg overflow-hidden">
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
          <Twitter className="hover:text-[#020305] transition-colors duration-300 hover:scale-110 cursor-pointer" />
          <Facebook className="hover:text-[#020305] transition-colors duration-300 hover:scale-110 cursor-pointer" />
          <Instagram className="hover:text-[#020305] transition-colors duration-300 hover:scale-110 cursor-pointer" />
        </div>
      </footer>
    </div>
  );
};

export default Space;
