import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Validation Schema
const mapSchema = Yup.object().shape({
  dimensions: Yup.string()
    .matches(/^\d+x\d+$/, "Format must be XxY (e.g., 100x200)")
    .required("Dimensions are required"),
  thumbnail: Yup.string()
    .url("Must be a valid URL")
    .required("Thumbnail is required"),
  name: Yup.string().required("Name is required"),
});

interface Element {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
}

interface DefaultElement {
  elementId: string;
  x: number;
  y: number;
}

const MapBuilder: React.FC = () => {
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [defaultElements, setDefaultElements] = useState<DefaultElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const token = localStorage.getItem("token");

  // Fetch elements from the API
  useEffect(() => {
    const fetchElements = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/elements",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setElements(response.data.elements); // Handle the elements array
      } catch (error) {
        console.error("Error fetching elements:", error);
      }
    };

    fetchElements();
  }, [token]);

  // Handle placing elements on the canvas
  const handleElementPlacement = (element: Element, x: number, y: number) => {
    setDefaultElements((prev) => [...prev, { elementId: element.id, x, y }]);
  };

  // Draw grid lines and the grass texture on the canvas
  const drawCanvasBackground = (ctx: CanvasRenderingContext2D) => {
    // Grass texture color
    ctx.fillStyle = "#b2d8b1";
    ctx.fillRect(
      0,
      0,
      canvasDimensions?.width || 0,
      canvasDimensions?.height || 0
    );

    // Draw grid lines
    const gridSpacing = 50;
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasDimensions?.width!; i += gridSpacing) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasDimensions?.height!);
      ctx.stroke();
    }
    for (let i = 0; i < canvasDimensions?.height!; i += gridSpacing) {
      ctx.moveTo(0, i);
      ctx.lineTo(canvasDimensions?.width!, i);
      ctx.stroke();
    }
  };

  // Draw elements on the canvas
  const drawElements = (ctx: CanvasRenderingContext2D) => {
    defaultElements.forEach((element) => {
      const placedElement = elements.find((e) => e.id === element.elementId);
      if (placedElement) {
        const img = new Image();
        img.src = placedElement.imageUrl;
        img.onload = () => {
          ctx.drawImage(
            img,
            element.x,
            element.y,
            placedElement.width * 50, // Scale element size
            placedElement.height * 50
          );
        };
      }
    });
  };

  // Handle canvas drawing on render
  const renderCanvas = () => {
    if (!canvasRef.current || !canvasDimensions) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      drawCanvasBackground(ctx); // Background and grid lines
      drawElements(ctx); // Draw placed elements
    }
  };

  useEffect(() => {
    renderCanvas(); // Redraw when elements or canvas dimensions change
  }, [defaultElements, canvasDimensions, elements]);

  // Submit map data
  const handleSubmit = async (values: any) => {
    if (!canvasDimensions) {
      alert("Please create the canvas first!");
      return;
    }

    const data = {
      ...values,
      dimensions: `${canvasDimensions.width}x${canvasDimensions.height}`,
      defaultElements,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/admin/map",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Map created successfully: " + JSON.stringify(response.data));
    } catch (error: any) {
      alert(
        "Error creating map: " + error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-center">Map Builder</h1>

      {/* Map Form */}
      <Formik
        initialValues={{ dimensions: "", thumbnail: "", name: "" }}
        validationSchema={mapSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-4 max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
            <div>
              <label
                htmlFor="dimensions"
                className="block font-medium text-gray-700"
              >
                Dimensions (XxY)
              </label>
              <Field
                id="dimensions"
                name="dimensions"
                type="text"
                placeholder="e.g., 100x200"
                className="mt-1 p-2 border rounded w-full"
              />
              <ErrorMessage
                name="dimensions"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="thumbnail"
                className="block font-medium text-gray-700"
              >
                Thumbnail URL
              </label>
              <Field
                id="thumbnail"
                name="thumbnail"
                type="text"
                placeholder="Enter thumbnail URL"
                className="mt-1 p-2 border rounded w-full"
              />
              <ErrorMessage
                name="thumbnail"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label htmlFor="name" className="block font-medium text-gray-700">
                Map Name
              </label>
              <Field
                id="name"
                name="name"
                type="text"
                placeholder="Enter map name"
                className="mt-1 p-2 border rounded w-full"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <button
              type="button"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={() => {
                const [width, height] = values.dimensions
                  .split("x")
                  .map(Number);
                setCanvasDimensions({ width, height });
              }}
            >
              Create Canvas
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Submit Map
            </button>
          </Form>
        )}
      </Formik>

      {/* Canvas and Element Selector */}
      <div className="flex gap-6">
        {canvasDimensions && (
          <canvas
            ref={canvasRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            className="border"
            onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              const x = Math.floor(e.clientX - rect.left);
              const y = Math.floor(e.clientY - rect.top);
              const selectedElement = elements[0]; // Replace with logic for selected element
              if (selectedElement)
                handleElementPlacement(selectedElement, x, y);
            }}
          />
        )}

        <div className="w-64 bg-white p-4 shadow rounded">
          <h3 className="font-bold mb-2">Elements</h3>
          <ul className="space-y-2">
            {elements.map((element) => (
              <li
                key={element.id}
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => {
                  setDefaultElements([
                    ...defaultElements,
                    { elementId: element.id, x: 0, y: 0 }, // Example: Set default placement
                  ]);
                }}
              >
                <img
                  src={element.imageUrl}
                  alt={element.id}
                  className="w-10 h-10 rounded"
                />
                {/* <span>{element.id}</span> */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MapBuilder;
