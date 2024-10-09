import React, { useState, useEffect } from 'react';
import './news.css';

const NewsUpdates = () => {
    const [newsItems, setNewsItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch('/api/news')
            .then(response => response.json())
            .then(data => {
                const newsArray = Object.values(data); // Assuming Firebase response is an object
                setNewsItems(newsArray);
            })
            .catch(error => console.error('Error fetching news:', error));
    }, []);

    const handleNext = () => {
        if (currentIndex < newsItems.length - 3) { // Subtract 3 to keep 3 items in view
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <section className="news-updates">
            <h2>Latest News And Updates</h2>
            <div className="news-carousel">
                <button className="prev-button" onClick={handlePrev}>{'<'}</button>
                <div className="carousel-container">
                    <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}>
                        {newsItems.map(item => (
                            <div key={item.id} className="news-item">
                                {item.title}
                            </div>
                        ))}
                    </div>
                </div>
                <button className="next-button" onClick={handleNext}>{'>'}</button>
            </div>
        </section>
    );
};

export default NewsUpdates;
