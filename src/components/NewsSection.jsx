import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Newspaper, Calendar, ExternalLink, Loader2 } from 'lucide-react';

export default function NewsSection() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('ALL');

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await axios.get('/api/news');
        if (res.data?.data) {
          setNews(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load news:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const filteredNews =
    selectedTopic === 'ALL'
      ? news
      : news.filter((item) => item.topics?.includes(selectedTopic));

  return (
    <div className="news-section-view">
      <div className="section-head-row">
        <div>
          <h3 className="section-heading">Indian Stock Market News & Reports</h3>
          <p className="section-subtext">
            Live press announcements, earnings releases, and financial developments sourced via IndianAPI.
          </p>
        </div>

        <div className="exchange-filter-pills">
          {['ALL', 'Markets', 'Companies', 'Money'].map((topic) => (
            <button
              key={topic}
              type="button"
              className={`filter-pill ${selectedTopic === topic ? 'active' : ''}`}
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="overview-loading-state">
          <Loader2 className="spin-icon" size={28} />
          <span>Retrieving Indian financial news feed...</span>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="empty-subpane">
          <Newspaper size={36} />
          <p>No articles available under this filter right now.</p>
        </div>
      ) : (
        <div className="news-grid-cards">
          {filteredNews.map((article, idx) => (
            <article key={idx} className="news-card-item">
              {article.image_url && (
                <div className="news-thumb-wrap">
                  <img src={article.image_url} alt={article.title} className="news-thumb" />
                </div>
              )}
              <div className="news-card-body">
                <div className="news-card-meta">
                  <span className="news-card-date">
                    <Calendar size={12} /> {article.pub_date || 'Recent'}
                  </span>
                  <span className="news-card-source">{article.source || 'LiveMint'}</span>
                </div>
                <h4 className="news-card-title">{article.title}</h4>
                <p className="news-card-summary">{article.summary}</p>
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card-link"
                  >
                    <span>Read Full Coverage</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
