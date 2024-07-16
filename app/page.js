"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [productForm, setProductForm] = useState({ slug: "", quantity: "", price: "" });
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingaction, setLoadingaction] = useState(false);
  const [dropdown, setDropdown] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/product');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAlert(`Error fetching products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAlert("Product added successfully");
        setProducts([...products, data.product]);
        setProductForm({ slug: "", quantity: "", price: "" });
        fetchProducts();
      } else {
        throw new Error(data.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setAlert(`Error adding product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buttonAction = async (action, slug, initialQuantity) => {
    try {
      setLoadingaction(true);
      const newProducts = products.map(p =>
        p.slug === slug ? { ...p, quantity: action === "plus" ? parseInt(p.quantity) + 1 : parseInt(p.quantity) - 1 } : p
      );
      setProducts(newProducts);

      const newDropdown = dropdown.map(p =>
        p.slug === slug ? { ...p, quantity: action === "plus" ? parseInt(p.quantity) + 1 : parseInt(p.quantity) - 1 } : p
      );
      setDropdown(newDropdown);

      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, slug, initialQuantity: parseInt(initialQuantity) })
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      const data = await response.json();
    } catch (error) {
      console.error('Error updating quantity:', error);
      setAlert(`Error updating quantity: ${error.message}`);
      fetchProducts();
    } finally {
      setLoadingaction(false);
    }
  };

  const handleChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.length > 2) {
      try {
        setLoading(true);
        setShowDropdown(true);
        const response = await fetch(`/api/search?query=${query}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setDropdown(data.products);
      } catch (error) {
        console.error('Error searching products:', error);
        setAlert(`Error searching products: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setAlert("Please enter at least 3 characters to search");
    }
  };

  const onDropdownEdit = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setQuery("");
    setDropdown([]);
    setShowDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200"
    >
      <Header />
      <div className="container mx-auto my-12 px-4 max-w-4xl">
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`text-center p-4 mb-8 rounded-lg shadow-lg ${
                alert.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {alert}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          className="text-5xl font-bold mb-12 text-purple-800 text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Product Inventory
        </motion.h1>

        <motion.div
          className="bg-white p-8 rounded-xl shadow-2xl mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-semibold mb-6 text-purple-700">Search a Product</h2>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              onChange={onDropdownEdit}
              value={query}
              type="text"
              placeholder="Enter a product name"
              className="flex-1 border border-purple-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
            />
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              Search
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              Clear
            </button>
          </form>

          {loading && (
            <div className='flex justify-center items-center my-4'>
              <img width={74} src="/loading.svg" alt="Loading" />
            </div>
          )}

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-purple-50 rounded-lg shadow-md overflow-hidden"
              >
                {dropdown.map(item => (
                  <motion.div
                    key={item.slug}
                    className="flex justify-between items-center p-4 border-b border-purple-200 hover:bg-purple-100 transition duration-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-purple-800 font-medium">
                      {item.slug} ({item.quantity} available for ₹{item.price})
                    </span>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => buttonAction("minus", item.slug, item.quantity)}
                        disabled={item.quantity <= 0}
                        className="px-3 py-1 bg-purple-500 text-white font-semibold rounded-lg shadow-md disabled:bg-purple-200 transition duration-300"
                      >
                        -
                      </button>
                      <span className="text-purple-700 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => buttonAction("plus", item.slug, item.quantity)}
                        className="px-3 py-1 bg-purple-500 text-white font-semibold rounded-lg shadow-md transition duration-300"
                      >
                        +
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-xl shadow-2xl mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-3xl font-semibold mb-6 text-purple-700">Add a Product</h2>
          <form onSubmit={addProduct} className="space-y-4">
            <div>
              <label htmlFor="productName" className="block mb-2 font-semibold text-purple-600">Product Slug</label>
              <input
                value={productForm.slug}
                name='slug'
                type="text"
                id="productName"
                onChange={handleChange}
                className="w-full border border-purple-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block mb-2 font-semibold text-purple-600">Quantity</label>
              <input
                value={productForm.quantity}
                name='quantity'
                type="number"
                id="quantity"
                onChange={handleChange}
                className="w-full border border-purple-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block mb-2 font-semibold text-purple-600">Price</label>
              <input
                value={productForm.price}
                name='price'
                type="number"
                id="price"
                onChange={handleChange}
                className="w-full border border-purple-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md font-semibold transition duration-300 ease-in-out"
              disabled={loading}
            >
              Add Product
            </button>
          </form>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-xl shadow-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-3xl font-semibold mb-6 text-purple-700">Current Stock</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Product Name</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.slug}
                    className={index % 2 === 0 ? "bg-purple-50" : "bg-white"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <td className="border-t px-4 py-3">{product.slug}</td>
                    <td className="border-t px-4 py-3">{product.quantity}</td>
                    <td className="border-t px-4 py-3">₹{product.price}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
