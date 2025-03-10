"use client";

import React, { useState } from 'react';
import {
  searchAmazonProducts,
  getProductDetails,
  AmazonScrapeProduct,
  AmazonProductDetails,
} from '@/lib/scrape'; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area"



function AmazonProductSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<AmazonScrapeProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AmazonProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);


  const handleSearch = async () => {
    setLoading(true);
    setSelectedProduct(null); // Clear previous selection
    try {
      const results = await searchAmazonProducts(searchTerm);
      setProducts(results);
    } catch (error) {
      console.error('Error searching:', error);
      // Optionally show a user-friendly error message using a toast or alert
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (productUrl: string) => {
    setLoadingDetails(true);
    try {
      const details = await getProductDetails(productUrl);
      setSelectedProduct(details);
    } catch (error) {
      console.error('Error fetching details:', error);
      // Optionally show a user-friendly error message
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Amazon Product Search</h1>

      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
          data-testid="search-input"
        />
        <Button onClick={handleSearch} disabled={loading} data-testid="search-button">
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </div>


      {/* Product List */}
      {products.length > 0 && (
          <ScrollArea className="h-72 w-full rounded-md border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {products.map((product) => (
            <Card key={product.productUrl} className="hover:shadow-lg cursor-pointer" onClick={() => handleProductClick(product.productUrl)} data-testid="product-card">
              <CardHeader>
                <CardTitle className="line-clamp-2">{product.productName}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={product.thumbnailUrl} alt={product.productName} className="w-full h-48 object-contain" />
              </CardContent>
            </Card>
          ))}
        </div>
          </ScrollArea>
      )}


      {/* Product Details */}
      {selectedProduct && (
        <Card data-testid="product-details">
          <CardHeader>
            <CardTitle>{selectedProduct.productName}</CardTitle>
              <CardDescription>
              {loadingDetails ? (<Skeleton className="w-[100px] h-[20px]"/>) : (<Badge variant="neutral">{selectedProduct.price}</Badge>)}
              </CardDescription>

          </CardHeader>
          <CardContent>
            {loadingDetails ? (
                <div className="space-y-4">
                <Skeleton className="w-full h-64" />
                    <div className="grid grid-cols-3 gap-2">
                      <Skeleton className="w-full h-24" />
                      <Skeleton className="w-full h-24" />
                      <Skeleton className="w-full h-24" />
                    </div>
                <Skeleton className="w-full h-8" />
                <Skeleton className="w-full h-8" />
              </div>
            ) : (
              <>
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {selectedProduct.mainImageUrl && (
                  <CarouselItem>
                    <img src={selectedProduct.mainImageUrl} alt={selectedProduct.productName} className="w-full aspect-square object-contain" />
                  </CarouselItem>
                )}
                {selectedProduct.additionalImages.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                      <img src={imageUrl} alt={`${selectedProduct.productName} - Additional Image ${index + 1}`} className="w-full aspect-square object-contain" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <p className="text-sm text-gray-700 mt-4 whitespace-pre-line">{selectedProduct.description}</p>
                </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AmazonProductSearch;