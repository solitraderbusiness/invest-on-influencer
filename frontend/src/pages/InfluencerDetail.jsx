import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function InfluencerDetail() {
  const { id } = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchInfluencerData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be actual API calls
        // const influencerResponse = await axios.get(`/api/v1/influencers/${id}`);
        // setInfluencer(influencerResponse.data);
        
        // const metricsResponse = await axios.get(`/api/v1/influencers/${id}/metrics`);
        // setMetrics(metricsResponse.data);
        
        // const postsResponse = await axios.get(`/api/v1/influencers/${id}/posts`);
        // setPosts(postsResponse.data);
        
        // Simulate data for development
        const mockInfluencer = {
          id: parseInt(id),
          username: 'tech_influencer',
          full_name: 'Tech Expert',
          bio: 'Sharing the latest in technology and digital innovation. Tech reviewer and industry analyst.',
          profile_pic_url: 'https://via.placeholder.com/150',
          external_url: 'https://techblog.example.com',
          follower_count: 1500000,
          following_count: 850,
          post_count: 1240,
          is_private: false,
          is_verified: true,
          category: 'Technology',
          engagement_rate: 4.8,
          growth_rate: 3.2,
          content_quality_score: 89,
          audience_quality_score: 92,
          brand_alignment_score: 87,
          overall_investment_score: 92,
          created_at: '2023-01-15T10:30:00Z',
          updated_at: '2023-10-20T14:45:00Z',
          last_scraped_at: '2023-10-20T14:30:00Z',
        };
        
        const mockMetrics = {
          follower_history: [
            { date: '2023-05-01', value: 1320000 },
            { date: '2023-06-01', value: 1350000 },
            { date: '2023-07-01', value: 1390000 },
            { date: '2023-08-01', value: 1420000 },
            { date: '2023-09-01', value: 1460000 },
            { date: '2023-10-01', value: 1500000 },
          ],
          engagement_history: [
            { date: '2023-05-01', value: 4.2 },
            { date: '2023-06-01', value: 4.3 },
            { date: '2023-07-01', value: 4.5 },
            { date: '2023-08-01', value: 4.6 },
            { date: '2023-09-01', value: 4.7 },
            { date: '2023-10-01', value: 4.8 },
          ],
          score_history: [
            { date: '2023-05-01', value: 85 },
            { date: '2023-06-01', value: 86 },
            { date: '2023-07-01', value: 88 },
            { date: '2023-08-01', value: 89 },
            { date: '2023-09-01', value: 90 },
            { date: '2023-10-01', value: 92 },
          ],
          audience_demographics: {
            age_groups: [
              { group: '13-17', percentage: 5 },
              { group: '18-24', percentage: 28 },
              { group: '25-34', percentage: 42 },
              { group: '35-44', percentage: 18 },
              { group: '45+', percentage: 7 },
            ],
            gender: [
              { group: 'Male', percentage: 68 },
              { group: 'Female', percentage: 30 },
              { group: 'Other', percentage: 2 },
            ],
            top_locations: [
              { location: 'United States', percentage: 42 },
              { location: 'United Kingdom', percentage: 12 },
              { location: 'Canada', percentage: 8 },
              { location: 'Germany', percentage: 7 },
              { location: 'Australia', percentage: 6 },
            ],
          },
        };
        
        const mockPosts = [
          {
            id: 101,
            instagram_id: 'post123',
            caption: 'Reviewing the latest smartphone technology! #tech #review',
            media_type: 'IMAGE',
            posted_at: '2023-10-15T09:30:00Z',
            like_count: 78500,
            comment_count: 3200,
            engagement_rate: 5.4,
            content_quality_score: 91,
          },
          {
            id: 102,
            instagram_id: 'post124',
            caption: 'My thoughts on the future of AI in everyday devices. #AI #technology',
            media_type: 'VIDEO',
            posted_at: '2023-10-10T14:20:00Z',
            like_count: 92300,
            comment_count: 4100,
            view_count: 320000,
            engagement_rate: 6.1,
            content_quality_score: 94,
          },
          {
            id: 103,
            instagram_id: 'post125',
            caption: 'Unboxing the newest gadgets! Which one is your favorite? #unboxing #gadgets',
            media_type: 'CAROUSEL_ALBUM',
            posted_at: '2023-10-05T11:45:00Z',
            like_count: 65800,
            comment_count: 2900,
            engagement_rate: 4.6,
            content_quality_score: 88,
          },
        ];
        
        setInfluencer(mockInfluencer);
        setMetrics(mockMetrics);
        setPosts(mockPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching influencer data:', err);
        setError('Failed to load influencer data. Please try again later.');
        setLoading(false);
      }
    };

    fetchInfluencerData();
  }, [id]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Influencer not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Influencer Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <img 
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200" 
                src={influencer.profile_pic_url || 'https://via.placeholder.com/150'} 
                alt={influencer.username} 
              />
            </div>
            <div className="ml-6 flex-1">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">@{influencer.username}</h1>
                {influencer.is_verified && (
                  <svg className="ml-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="mt-1 text-lg text-gray-700">{influencer.full_name}</p>
              <p className="mt-2 text-gray-600">{influencer.bio}</p>
              <div className="mt-4 flex items-center space-x-6">
                <div>
                  <span className="text-xl font-semibold text-gray-900">{formatNumber(influencer.follower_count)}</span>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>
                <div>
                  <span className="text-xl font-semibold text-gray-900">{formatNumber(influencer.following_count)}</span>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
                <div>
                  <span className="text-xl font-semibold text-gray-900">{formatNumber(influencer.post_count)}</span>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
                <div>
                  <span className="text-xl font-semibold text-gray-900">{influencer.engagement_rate}%</span>
                  <p className="text-sm text-gray-500">Engagement</p>
                </div>
                <div>
                  <div className="flex items-center">
                    {influencer.growth_rate > 0 ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className="text-xl font-semibold text-gray-900">{influencer.growth_rate}%</span>
                  </div>
                  <p className="text-sm text-gray-500">Growth Rate</p>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex flex-col items-end">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-gray-500">Investment Score</p>
                <p className="text-3xl font-bold text-blue-600">{influencer.overall_investment_score}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getScoreColor(influencer.overall_investment_score)}`} 
                    style={{ width: `${influencer.overall_investment_score}%` }}
                  ></div>
                </div>
              </div>
              <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {influencer.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`${activeTab === 'metrics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics & Growth
          </button>
          <button
            className={`${activeTab === 'audience' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('audience')}
          >
            Audience Analysis
          </button>
          <button
            className={`${activeTab === 'content' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('content')}
          >
            Content Performance
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Investment Metrics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Investment Metrics</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Overall Score</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{influencer.overall_investment_score}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColor(influencer.overall_investment_score)}`} 
                    style={{ width: `${influencer.overall_investment_score}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Content Quality</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{influencer.content_quality_score}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColor(influencer.content_quality_score)}`} 
                    style={{ width: `${influencer.content_quality_score}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Audience Quality</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{influencer.audience_quality_score}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColor(influencer.audience_quality_score)}`} 
                    style={{ width: `${influencer.audience_quality_score}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500">Brand Alignment</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{influencer.brand_alignment_score}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getScoreColor(influencer.brand_alignment_score)}`} 
                    style={{ width: `${influencer.brand_alignment_score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Trend */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Growth Trend</h2>
            {metrics && metrics.follower_history && (
              <div className="h-64">
                <Line 
                  data={{
                    labels: metrics.follower_history.map(item => {
                      const date = new Date(item.date);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }),
                    datasets: [
                      {
                        label: 'Followers',
                        data: metrics.follower_history.map(item => item.value),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        title: {
                          display: true,
                          text: 'Followers',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                  }} 
                />
              </div>
            )}
          </div>

          {/* Recent Posts */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Posts</h2>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">{formatDate(post.posted_at)}</p>
                      <p className="mt-1 text-gray-900">{post.caption}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">Likes</p>
                          <p className="font-medium">{formatNumber(post.like_count)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Comments</p>
                          <p className="font-medium">{formatNumber(post.comment_count)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Engagement</p>
                          <p className="font-medium">{post.engagement_rate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Follower Growth Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Follower Growth</h2>
            {metrics && metrics.follower_history && (
              <div className="h-64">
                <Line 
                  data={{
                    labels: metrics.follower_history.map(item => {
                      const date = new Date(item.date);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }),
                    datasets: [
                      {
                        label: 'Followers',
                        data: metrics.follower_history.map(item => item.value),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        title: {
                          display: true,
                          text: 'Followers',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                  }} 
                />
              </div>
            )}
          </div>

          {/* Engagement Rate Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Engagement Rate</h2>
            {metrics && metrics.engagement_history && (
              <div className="h-64">
                <Line 
                  data={{
                    labels: metrics.engagement_history.map(item => {
                      const date = new Date(item.date);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }),
                    datasets: [
                      {
                        label: 'Engagement Rate (%)',
                        data: metrics.engagement_history.map(item => item.value),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        title: {
                          display: true,
                          text: 'Engagement Rate (%)',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                  }} 
                />
              </div>
            )}
          </div>

          {/* Investment Score Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Investment Score Trend</h2>
            {metrics && metrics.score_history && (
              <div className="h-64">
                <Line 
                  data={{
                    labels: metrics.score_history.map(item => {
                      const date = new Date(item.date);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }),
                    datasets: [
                      {
                        label: 'Investment Score',
                        data: metrics.score_history.map(item => item.value),
                        borderColor: 'rgb(79, 70, 229)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: