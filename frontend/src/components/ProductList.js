// ...existing code...
import { useState, useEffect } from "react";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchProducts = async () => {
        if (!hasMore) return;

        const response = await fetch(`/api/products?page=${page}&limit=9`);
        const data = await response.json();

        setProducts(prev => [...prev, ...data.data]);
        setPage(prev => prev + 1);
        setHasMore(data.hasMore);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
            fetchProducts();
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
            {hasMore && <div>Loading...</div>}
        </div>
    );
};

export default ProductList;
