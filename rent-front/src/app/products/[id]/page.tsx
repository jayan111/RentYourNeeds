'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, ShoppingCart, Heart, Share2, Calendar, Shield, Truck, ArrowLeft, Tag, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { Product } from '@/types';
import { productAPI } from '@/lib/api';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { TenureSelector } from '@/components/ui/TenureSelector';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tenureMonths, setTenureMonths] = useState(3);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getById(params.id as string);
        setProduct(response.data.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = () => {
    if (product && !addingToCart) {
      setAddingToCart(true);
      dispatch(addToCart({ product, quantity: quantity, tenureMonths }));
      
      setTimeout(() => {
        setAddingToCart(false);
      }, 1500);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products" className="text-primary-600 hover:text-primary-700">
          Back to products
        </Link>
      </div>
    );
  }

  const monthlyPrice = product.price; // Convert daily price to monthly
  const totalPrice = monthlyPrice * tenureMonths * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6 animate-slide-up">
        <Link href="/products" className="hover:text-primary-600 transition-colors flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>
        <span>/</span>
        <span className="capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="animate-slide-right">
          <ImageCarousel images={product.images} productName={product.name} />
          
          {/* Discount Badge */}
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
            45% OFF
          </div>
        </div>

        {/* Product Info */}
        <div className="animate-slide-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {product.category}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                Excellent Condition
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    'w-5 h-5',
                    i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  )} 
                />
              ))}
              <span className="ml-2 text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Pricing */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6">
            <div className="flex flex-wrap items-baseline mb-2">
              <span className="text-lg text-gray-500 line-through mr-2">{Math.round(monthlyPrice * 1.8)}</span>
              <span className="text-2xl sm:text-3xl font-bold text-primary-600">{monthlyPrice}</span>
              <span className="text-gray-600 ml-2 text-sm sm:text-base">/month</span>
            </div>
            <p className="text-sm text-green-600 font-medium mb-4">Save {Math.round(monthlyPrice * 0.8)} per month!</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <TenureSelector
                value={tenureMonths}
                onChange={setTenureMonths}
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 sm:p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-base sm:text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary-600 text-lg sm:text-xl">{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className={cn(
              'w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2',
              product.stock > 0 && !addingToCart
                ? 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 shadow-lg hover:shadow-xl'
                : addingToCart
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            {addingToCart ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
              </>
            )}
          </button>

          {/* Offers & Coupons */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-6 border border-yellow-200">
            <div className="flex items-center mb-2">
              <Tag className="w-5 h-5 text-orange-600 mr-2" />
              <h3 className="font-semibold text-orange-800">Special Offers</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-orange-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>FIRST20 - 20% off first rental</span>
              </div>
              <div className="flex items-center text-orange-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>WEEK10 - 10% off weekly rentals</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Flexible Rental</h4>
              <p className="text-xs text-gray-600">Choose your dates</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Insured</h4>
              <p className="text-xs text-gray-600">Full coverage</p>
            </div>
            <div className="text-center">
              <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <h4 className="font-medium text-sm">Free Delivery</h4>
              <p className="text-xs text-gray-600">Within 10 miles</p>
            </div>
          </div>

          {/* Stock Info */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <span className="font-medium">{product.stock} items</span> available for rent
            </p>
          </div>
        </div>
      </div>
      
      {/* Delivery Steps & FAQ */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Steps */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Truck className="w-6 h-6 text-primary-600 mr-2" />
            Delivery Process
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold">Order Confirmation</h4>
                <p className="text-sm text-gray-600">Receive instant confirmation and rental details</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold">Preparation</h4>
                <p className="text-sm text-gray-600">Item is cleaned, tested, and prepared for delivery</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold">Delivery</h4>
                <p className="text-sm text-gray-600">Free delivery within 10 miles, setup included</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold">Enjoy & Return</h4>
                <p className="text-sm text-gray-600">Use the item and schedule return pickup</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* FAQ */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">What if the item gets damaged?</h4>
              <p className="text-sm text-gray-600">All rentals include damage protection. Minor wear is expected.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Can I extend my rental?</h4>
              <p className="text-sm text-gray-600">Yes, extensions are available subject to availability.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">What's included with delivery?</h4>
              <p className="text-sm text-gray-600">Free delivery, setup, and pickup within 10 miles.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">How do returns work?</h4>
              <p className="text-sm text-gray-600">Schedule a pickup or drop off at our location.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}