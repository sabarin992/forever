"use client";

import { useEffect, useState } from "react";
import { assets } from "../admin_assets/assets";
import axios from "axios";
import api, { API_BASE_URL } from "../../api";
import { toast } from "react-toastify";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useLocation } from "react-router-dom";

const AdminEditProduct = () => {
  const [product, setProduct] = useState({
    category: "Men",
    name: "",
    description: "",
    variants: [
      {
        size: "S",
        color: "",
        price: "",
        stock_quantity: "",
        images: [false, false, false, false],
      },
    ],
  });

  // State for image cropping
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState("");
  const [imgElement, setImgElement] = useState(null);

  const [categories,setCategories] = useState([])

  const location = useLocation();
  const { id } = location.state;

  useEffect(() => {
    const getProductData = async () => {
      try {
        const res = await api.get(`/edit_product/${id}/`);
        setProduct(res.data);
      } catch (error) {
        console.log(error.message);
      }
    };
    getProductData();  
  }, []);

  useEffect(() => {
    // get categories
    const getCategories = async () => {
      try {
        const res = await api.get("get_all_listed_categories")
        setCategories(res.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    }
    getCategories()
  }, []);

  // Function to add a new variant
  const addVariant = () => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      variants: [
        ...prevProduct.variants,
        {
          size: "S",
          color: "",
          price: "",
          stock_quantity: "",
          images: [false, false, false, false],
        },
      ],
    }));
  };

  const editProduct = async () => {
    try {
      const res = await api.put(`/edit_product/${id}/`, product, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensures proper file handling
        },
      });
      res.status === 200
        ? toast.success("The product edit successfully")
        : toast.error("The product is not edit properly");
    } catch (error) {
      console.log(error.message);
      toast.error("Error adding product");
    }
  };

  // Function to handle image selection
  const handleImageSelect = (e, variantIndex, imageIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set current indices for tracking which image is being cropped
    setCurrentVariantIndex(variantIndex);
    setCurrentImageIndex(imageIndex);

    // Create a URL for the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Function to handle image load in the crop component
  const onImageLoad = (e) => {
    setImgElement(e.currentTarget);

    // Create a centered crop with aspect ratio 1:1
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1, // 1:1 aspect ratio
        width,
        height
      ),
      width,
      height
    );

    setCrop(crop);
  };

  // Function to apply crop to image
  const applyCrop = () => {
    if (!imgElement || !crop.width || !crop.height) {
      toast.error("Please select a crop area");
      return;
    }

    // Create a canvas to draw the cropped image
    const canvas = document.createElement("canvas");
    const scaleX = imgElement.naturalWidth / imgElement.width;
    const scaleY = imgElement.naturalHeight / imgElement.height;

    // Set canvas dimensions to the cropped area
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    // Draw the cropped image on the canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      imgElement,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Failed to create image");
          return;
        }

        // Create a File object from the blob
        const croppedFile = new File(
          [blob],
          `cropped-image-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        // Update the product state with the cropped image
        setProduct((prev) => {
          const updatedVariants = [...prev.variants];
          updatedVariants[currentVariantIndex].images[currentImageIndex] =
            croppedFile;
          return { ...prev, variants: updatedVariants };
        });

        // Close the crop modal
        setShowCropModal(false);
        setImgSrc("");
        setImgElement(null);

        toast.success("Image cropped successfully");
      },
      "image/jpeg",
      0.95
    );
  };

  // Function to cancel cropping
  const cancelCrop = () => {
    setShowCropModal(false);
    setImgSrc("");
    setImgElement(null);
    setCrop({
      unit: "%",
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    });
  };

  // Function to remove a variant
  const removeVariant = (index) => {
    setProduct((prevProduct) => {
      const updatedVariants = [...prevProduct.variants];
      updatedVariants.splice(index, 1); // remove variant at index
      return { ...prevProduct, variants: updatedVariants };
    });
  };

  return (
    <div className="flex flex-col gap-3 relative">
      <h2>Edit Product</h2>

      <div className="mb-3">
        <p>Enter the Category</p>
        <select
          onChange={(e) => {
            setProduct((prev) => {
              return { ...prev, category: e.target.value };
            });
          }}
          className="w-full max-w-[500px] px-3 py-2 border rounded border-[#c2c2c2] outline-[#c586a5]"
          name=""
          id=""
        >
          {
            categories.map((category, index) => {
              return (
                <option key={index} value={category}>
                  {category}
                </option>
              );
            })
          }
        </select>
      </div>

      <div className="w-full">
        <p className="mb-2">Enter the product name</p>
        <input
          onChange={(e) => {
            setProduct((prev) => {
              return { ...prev, name: e.target.value };
            });
          }}
          type="text"
          className="w-full max-w-[500px] px-3 py-2 border rounded border-[#c2c2c2] outline-[#c586a5]"
          placeholder="Enter the Product Name"
          value={product.name}
          name=""
          id=""
          required
        />
      </div>
      <div className="w-full">
        <p className="mb-2">Enter the product Description</p>
        <textarea
          onChange={(e) => {
            setProduct((prev) => {
              return { ...prev, description: e.target.value };
            });
          }}
          value={product.description}
          type="text"
          className="w-full max-w-[500px] px-3 py-2 border rounded border-[#c2c2c2] outline-[#c586a5]"
          placeholder="Enter the Decription"
          name=""
          id=""
          required
        />
      </div>

      {/* map product variants array */}
      {product.variants.map((variant, variantIndex) => (
        <div key={variantIndex}>
          {/* <h4 className="mb-5 underline">Variant {variantIndex + 1}</h4> */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="underline">Variant {variantIndex + 1}</h4>
            {product.variants.length > 1 && (
              <button
                onClick={() => removeVariant(variantIndex)}
                className="text-red-600 underline hover:text-red-800 text-sm"
              >
                Remove Variant
              </button>
            )}
          </div>

          {/* variants images */}
          <div>
            <p className="mb-2">Upload Image</p>
            <div className="flex gap-2 mb-3">
              {
                // {/* map product variants image array */}
                variant.images.map((image, imageIndex) => {
                  return (
                    <label
                      htmlFor={`image${variantIndex}${imageIndex}`}
                      key={imageIndex}
                      className="cursor-pointer"
                    >
                      <img
                        className="w-20 h-20 object-cover border"
                        src={
                          !image
                            ? assets.upload_area
                            : typeof image === "string"
                            ? image
                            : URL.createObjectURL(image)
                        }
                        alt=""
                      />
                      <input
                        onChange={(e) =>
                          handleImageSelect(e, variantIndex, imageIndex)
                        }
                        type="file"
                        id={`image${variantIndex}${imageIndex}`}
                        hidden
                        accept="image/*"
                      />
                    </label>
                  );
                })
              }
            </div>
          </div>

          {/* variants */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8 mb-3">
            {/* Product Color */}
            <div>
              <p className="mb-2">color</p>
              <input
                type="text"
                placeholder="Color"
                className="w-full px-3 py-2 sm:w-[120px] border rounded border-[#c2c2c2] outline-[#c586a5]"
                value={variant.color}
                onChange={(e) => {
                  const updatedVariants = [...product.variants];
                  updatedVariants[variantIndex].color = e.target.value;
                  setProduct({ ...product, variants: updatedVariants });
                }}
              />
            </div>

            {/* Product Price */}
            <div>
              <p className="mb-2">Price</p>
              <input
                type="number"
                placeholder="Price"
                className="w-full px-3 py-2 sm:w-[120px] border rounded border-[#c2c2c2] outline-[#c586a5]"
                value={variant.price}
                onChange={(e) => {
                  const updatedVariants = [...product.variants];
                  updatedVariants[variantIndex].price = Number(e.target.value);
                  setProduct({ ...product, variants: updatedVariants });
                }}
              />
            </div>

            {/* Product Stock Quantity */}
            <div>
              <p className="mb-2">stock_quantity</p>
              <input
                type="number"
                placeholder="Stock Quantity"
                className="w-full px-3 py-2 sm:w-[120px] border rounded border-[#c2c2c2] outline-[#c586a5]"
                value={variant.stock_quantity}
                onChange={(e) => {
                  const updatedVariants = [...product.variants];
                  updatedVariants[variantIndex].stock_quantity = Number(
                    e.target.value
                  );
                  setProduct({ ...product, variants: updatedVariants });
                }}
              />
            </div>
          </div>

          {/* Product size with select box */}
          <div>
            <p className="mb-2">Product Size</p>
            <select
              onChange={(e) => {
                const productCopy = structuredClone(product);
                productCopy.variants[variantIndex].size = e.target.value;
                setProduct(productCopy);
              }}
              value={variant.size}
              className="w-20 px-3 py-2 border rounded border-[#c2c2c2] outline-[#c586a5]"
            >
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        </div>
      ))}

      <div>
        <button
          className="bg-black text-white w-28 py-3 mt-4"
          onClick={addVariant}
        >
          Add Variant
        </button>
      </div>

      <div>
        <button
          className="bg-black text-white w-28 py-3 mt-4"
          onClick={editProduct}
        >
          Edit Product
        </button>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
            <h3 className="text-xl font-semibold mb-4">Crop Image</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag to adjust the crop area. The image will be cropped to a
              square.
            </p>

            <div className="mb-6 overflow-auto max-h-[60vh] flex justify-center">
              {imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={1}
                  circularCrop={false}
                  className="max-w-full"
                >
                  <img
                    src={imgSrc || "/placeholder.svg"}
                    onLoad={onImageLoad}
                    alt="Crop preview"
                    className="max-w-full max-h-[50vh] object-contain"
                  />
                </ReactCrop>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                onClick={cancelCrop}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                onClick={applyCrop}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditProduct;
