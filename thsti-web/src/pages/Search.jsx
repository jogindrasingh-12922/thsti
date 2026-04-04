import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/env';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                setResults(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [query]);

    return (
        <section className="bg-white p-5 py-10 min-h-screen">
            <div className="container mx-auto auto-container">
                <h1 className="mb-4 text-3xl font-bold border-b pb-2">Search Results for "{query}"</h1>
                {loading ? (
                    <p>Loading results...</p>
                ) : results.length > 0 ? (
                    <ul className="list-group">
                        {results.map((r, i) => (
                            <li key={i} className="list-group-item mb-4 p-4 shadow-sm border border-gray-200 rounded">
                                <h3 className="text-xl font-bold"><a href={r.url} className="text-blue-800 hover:underline">{r.title}</a></h3>
                                <p className="text-gray-500 mb-2 mt-1 uppercase text-sm font-semibold tracking-wider">{r.type}</p>
                                <p className="text-gray-700">{r.snippet}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-lg">No results found for your query. Try a different search term.</p>
                )}
            </div>
        </section>
    );
};

export default Search;
