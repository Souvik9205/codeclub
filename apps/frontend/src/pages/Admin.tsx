import React from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import MapBuilder from "./extra/mapbuilder";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const Admin: React.FC = () => {
  const token = localStorage.getItem("token");

  // Validation Schemas
  const avatarSchema = Yup.object().shape({
    imageUrl: Yup.string()
      .url("Must be a valid URL")
      .required("Image URL is required"),
    name: Yup.string().required("Name is required"),
  });

  const elementSchema = Yup.object().shape({
    imageUrl: Yup.string()
      .url("Must be a valid URL")
      .required("Image URL is required"),
    width: Yup.number()
      .positive("Must be a positive number")
      .required("Width is required"),
    height: Yup.number()
      .positive("Must be a positive number")
      .required("Height is required"),
    static: Yup.boolean(),
  });

  // API Calls
  const handleAvatarSubmit = async (values: any, { resetForm }: any) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/admin/avatar",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`Avatar created successfully: ${JSON.stringify(response.data)}`);
      resetForm();
    } catch (error: any) {
      alert(
        `Error creating avatar: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleElementSubmit = async (values: any, { resetForm }: any) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/admin/element",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`Element created successfully: ${JSON.stringify(response.data)}`);
      resetForm();
    } catch (error: any) {
      alert(
        `Error creating element: ${error.response?.data?.message || error.message}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">Admin Panel</h1>

      <div className="w-full flex gap-5  justify-around">
        {/* Avatar Form */}
        <div className="w-1/2 mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create Avatar</h2>
          <Formik
            initialValues={{ imageUrl: "", name: "" }}
            validationSchema={avatarSchema}
            onSubmit={handleAvatarSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="avatarImageUrl"
                    className="block font-medium text-gray-700"
                  >
                    Image URL
                  </label>
                  <Field
                    id="avatarImageUrl"
                    name="imageUrl"
                    type="text"
                    placeholder="Enter image URL"
                    className="mt-1 p-2 border rounded w-full"
                  />
                  <ErrorMessage
                    name="imageUrl"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="avatarName"
                    className="block font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <Field
                    id="avatarName"
                    name="name"
                    type="text"
                    placeholder="Enter name"
                    className="mt-1 p-2 border rounded w-full"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  {isSubmitting ? "Submitting..." : "Create Avatar"}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Element Form */}
        <div className="w-1/2 mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create Element</h2>
          <Formik
            initialValues={{
              imageUrl: "",
              width: "",
              height: "",
              static: false,
            }}
            validationSchema={elementSchema}
            onSubmit={handleElementSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label
                    htmlFor="elementImageUrl"
                    className="block font-medium text-gray-700"
                  >
                    Image URL
                  </label>
                  <Field
                    id="elementImageUrl"
                    name="imageUrl"
                    type="text"
                    placeholder="Enter image URL"
                    className="mt-1 p-2 border rounded w-full"
                  />
                  <ErrorMessage
                    name="imageUrl"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="elementWidth"
                    className="block font-medium text-gray-700"
                  >
                    Width (px)
                  </label>
                  <Field
                    id="elementWidth"
                    name="width"
                    type="number"
                    placeholder="Enter width"
                    className="mt-1 p-2 border rounded w-full"
                  />
                  <ErrorMessage
                    name="width"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="elementHeight"
                    className="block font-medium text-gray-700"
                  >
                    Height (px)
                  </label>
                  <Field
                    id="elementHeight"
                    name="height"
                    type="number"
                    placeholder="Enter height"
                    className="mt-1 p-2 border rounded w-full"
                  />
                  <ErrorMessage
                    name="height"
                    component="div"
                    className="text-sm text-red-500 mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Field
                    id="elementStatic"
                    name="static"
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <label htmlFor="elementStatic" className="text-gray-700">
                    Static
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  {isSubmitting ? "Submitting..." : "Create Element"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Map Builder */}
      <DndProvider backend={HTML5Backend}>
        <MapBuilder />
      </DndProvider>
    </div>
  );
};

export default Admin;
